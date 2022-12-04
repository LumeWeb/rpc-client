import {
  ClientRPCRequest,
  RPCBroadcastRequest,
  RPCBroadcastResponse,
  RPCRequest,
  RPCResponse,
} from "@lumeweb/relay-types";
import { clearTimeout } from "timers";
import b4a from "b4a";
import {
  flatten,
  isPromise,
  validateResponse,
  validateTimestampedResponse,
} from "../util.js";
import { blake2b } from "libskynet";
import { ERR_INVALID_SIGNATURE, ERR_NO_RELAYS } from "../error.js";
import RpcQueryBase from "./base.js";
import { getActiveRelay, setupRelay } from "../sharedRelay.js";

function flatHash(data: any) {
  const flattenedData = flatten(data).sort();
  return Buffer.from(
    blake2b(Buffer.from(JSON.stringify(flattenedData)))
  ).toString("hex");
}

export default class WisdomRpcQuery extends RpcQueryBase {
  protected declare _response?: RPCBroadcastResponse;
  protected declare _query: ClientRPCRequest;
  get result(): Promise<RPCResponse> {
    return this._promise as Promise<RPCResponse>;
  }

  protected async _run(): Promise<void> {
    await setupRelay(this._network);
    await this.queryRelay();
    await this.checkResponse();
  }

  protected resolve(data?: RPCResponse, timeout: boolean = false): void {
    clearTimeout(this._timeoutTimer);
    this._timeout = timeout;
    this._completed = true;

    if (timeout) {
      data = {
        error: "timeout",
      };
    }

    this._promiseResolve?.(data);
  }

  protected async queryRelay(): Promise<any> {
    let activeRelay = getActiveRelay();
    let relays = this.getRelays();

    if (!relays.length) {
      throw new Error(ERR_NO_RELAYS);
    }

    return this.queryRpc(activeRelay, {
      module: "rpc",
      method: "broadcast_request",
      data: {
        request: this._query,
        relays,
      },
    } as RPCRequest);
  }

  protected async checkResponse() {
    if (this._error) {
      this.resolve({ error: this._error });
      return;
    }

    if (
      !validateResponse(
        // @ts-ignore
        getActiveRelay().stream.remotePublicKey,
        this._response as RPCResponse
      )
    ) {
      this.resolve({ error: ERR_INVALID_SIGNATURE });
      return;
    }

    let relays: RPCResponse[] = [];

    for (const relay in this._response?.relays) {
      const resp = this._response?.relays[relay];
      if (
        validateTimestampedResponse(
          b4a.from(relay, "hex") as Buffer,
          resp as RPCResponse
        )
      ) {
        relays.push(resp as RPCResponse);
      }
    }

    if (!relays.length) {
      this.resolve({ error: ERR_NO_RELAYS });
      return;
    }

    type ResponseGroup = { [response: string]: number };

    const responseObjects = relays.reduce((output: any, item: RPCResponse) => {
      const field = item.signedField || "data";
      // @ts-ignore
      const hash = flatHash(item[field]);
      output[hash] = item?.data;
      return output;
    }, {});

    const responses: ResponseGroup = relays.reduce(
      (output: ResponseGroup, item: RPCResponse) => {
        const field = item.signedField || "data";
        // @ts-ignore
        const hash = flatHash(item[field]);
        output[hash] = output[hash] ?? 0;
        output[hash]++;
        return output;
      },
      {}
    );

    for (const responseHash in responses) {
      if (
        responses[responseHash] / relays.length >=
        this._network.majorityThreshold
      ) {
        let response: RPCResponse = responseObjects[responseHash];

        response = { data: response };

        this.resolve(response);
        break;
      }
    }
  }

  protected getRelays(): string[] {
    if (
      this._network.maxRelays === 0 ||
      this._network.relays.length <= this._network.maxRelays
    ) {
      return this._network.relays;
    }

    const list: string[] = [];
    let available = this._network.relays;

    while (list.length <= this._network.maxRelays) {
      const item = Math.floor(Math.random() * available.length);
      list.push(available[item]);
      available.splice(item, 1);
    }

    return list;
  }
}
