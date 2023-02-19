import RpcNetwork from "../network.js";
import { ClientRPCRequest, RPCResponse } from "@lumeweb/relay-types";
import { RpcQueryOptions } from "../types.js";
import b4a from "b4a";
import { hashQuery, isPromise, validateTimestampedResponse } from "../util.js";
import RPC from "@lumeweb/rpc";
import { ERR_INVALID_SIGNATURE } from "../error.js";
import RpcQueryBase from "./base.js";

export default class SimpleRpcQuery extends RpcQueryBase {
  protected _relay: string;
  protected declare _query: ClientRPCRequest;

  constructor(
    network: RpcNetwork,
    relay: string,
    query: ClientRPCRequest,
    options: RpcQueryOptions
  ) {
    super(network, query, options);
    this._relay = relay;
  }

  protected async _run(): Promise<void> {
    await this.queryRelay();
    await this.checkResponses();
  }

  protected async queryRelay(): Promise<any> {
    let socket: any;

    try {
      socket = this._network.dht.connect(b4a.from(this._relay, "hex"));
      if (isPromise(socket)) {
        socket = await socket;
      }
    } catch (e) {
      return;
    }
    await socket.opened;

    const rpc = new RPC(socket);

    if (this._query.bypassCache) {
      delete this._query.bypassCache;
      await this.queryRpc(rpc, {
        module: "rpc",
        method: "clear_cached_item",
        data: hashQuery(this._query),
      });
    }

    if ("bypassCache" in this._query) {
      delete this._query.bypassCache;
    }

    try {
      await this.queryRpc(rpc, this._query);
    } catch (e: any) {
      // @ts-ignore
      rpc.end();
      throw e;
    }

    // @ts-ignore
    rpc.end();
  }

  protected async checkResponses() {
    let response: RPCResponse = this._response as RPCResponse;

    if (this._error) {
      response = { error: this._error };
    }

    if (
      !response.error &&
      !validateTimestampedResponse(
        b4a.from(this._relay, "hex") as Buffer,
        response
      )
    ) {
      response = { error: ERR_INVALID_SIGNATURE };
    }

    this.resolve(response);
  }
}
