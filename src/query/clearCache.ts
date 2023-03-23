import RpcNetwork from "../network.js";
import { RPCBroadcastRequest, RPCRequest } from "@lumeweb/interface-relay";
import { RpcQueryOptions } from "../types.js";
import { hashQuery } from "../util.js";
import SimpleRpcQuery from "./simple.js";

export default class ClearCacheRpcQuery extends SimpleRpcQuery {
  protected _relays: string[];

  constructor({
    network,
    relays,
    query,
    options,
  }: {
    network: RpcNetwork;
    relays: string[];
    query: RPCRequest;
    options: RpcQueryOptions;
  }) {
    super({ network, relay: "", query, options });
    this._relays = relays;
  }

  protected async _run(): Promise<void> {
    // @ts-ignore
    this._relay = getActiveRelay().stream.remotePublicKey;
    await this.queryRelay();
    await this.checkResponses();
  }

  protected async queryRelay(): Promise<any> {
    return this.queryRpc(
      this._network.getAvailableRelay("rpc", "broadcast_request"),
      {
        module: "rpc",
        method: "broadcast_request",
        data: {
          request: {
            module: "rpc",
            method: "clear_cached_item",
            data: hashQuery(this._query),
          },
          relays: this._relays,
        } as RPCBroadcastRequest,
      }
    );
  }
}
