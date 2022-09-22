import RpcQueryBase from "./base.js";
import { flatten } from "../util.js";
import { Buffer } from "buffer";
import type { RPCResponse } from "@lumeweb/relay-types";
import { blake2b } from "libskynet";
import { ERR_MAX_TRIES_HIT } from "../error.js";

function flatHash(data: any) {
  const flattenedData = flatten(data).sort();
  return Buffer.from(
    blake2b(Buffer.from(JSON.stringify(flattenedData)))
  ).toString("hex");
}

export default class WisdomRpcQuery extends RpcQueryBase {
  private _maxTries = 3;
  private _tries = 0;

  protected checkResponses(): void {
    const responseStore = this._responses;
    const responseStoreData = Object.values(responseStore);

    type ResponseGroup = { [response: string]: number };

    const responseObjects = responseStoreData.reduce((output: any, item) => {
      const hash = flatHash(item?.data);
      output[hash] = item?.data;
      return output;
    }, {});
    const responses: ResponseGroup = responseStoreData.reduce(
      (output: ResponseGroup, item) => {
        const hash = flatHash(item?.data);
        output[hash] = output[hash] ?? 0;
        output[hash]++;
        return output;
      },
      {}
    );

    if (!Object.keys(responses).length) {
      if (Object.keys(this._errors).length) {
        this.resolve({ error: Object.values(this._errors).pop() });
        return;
      }
      if (this._tries <= this._maxTries) {
        this._tries++;
        this.retry();
        return;
      }
      this.resolve({ data: { error: ERR_MAX_TRIES_HIT } });
      return;
    }
    for (const responseHash in responses) {
      if (
        responses[responseHash] / responseStoreData.length >=
        this._network.majorityThreshold
      ) {
        let response: RPCResponse = responseObjects[responseHash];

        // @ts-ignore
        if (null === response) {
          if (this._tries <= this._maxTries) {
            this._tries++;
            this.retry();
            return;
          }

          response = { error: ERR_MAX_TRIES_HIT };
        }

        this.resolve({ data: response });
        break;
      }
    }
  }

  private retry() {
    this._responses = {};
    this._errors = {};

    if (this._completed) {
      return;
    }

    this.run();
  }

  protected getRelays(): string[] | [] {
    if (
      this._network.maxRelays === 0 ||
      this._network.relays.length <= this._network.maxRelays
    ) {
      return this._network.relays;
    }

    const list: string[] = [];
    let available = this._network.relays;

    while (list.length < this._network.maxRelays) {
      const item = Math.floor(Math.random() * available.length);
      list.push(available[item]);
      available.splice(item, 1);
    }

    return list;
  }
}
