import { ClientRPCRequest, RPCRequest } from "@lumeweb/relay-types";
import { RpcQueryOptions } from "../types.js";
import SimpleRpcQuery from "./simple.js";
import ClearCacheRpcQuery from "./clearCache.js";
import RpcNetwork from "../network.js";
import RpcQueryBase from "./base.js";

export default class RpcNetworkQueryFactory {
  private _network: RpcNetwork;

  constructor(network: RpcNetwork) {
    this._network = network;
  }

  simple({
    relay,
    query,
    options = {},
  }: {
    relay?: string | Buffer;
    query: ClientRPCRequest;
    options?: RpcQueryOptions;
  }): SimpleRpcQuery {
    return new SimpleRpcQuery({
      network: this._network,
      relay,
      query: {
        ...query,
        bypassCache: query?.bypassCache || this._network.bypassCache,
      },
      options,
    }).run();
  }

  clearCache({
    relays,
    query,
    options = {},
  }: {
    relays: string[];
    query: RPCRequest;
    options?: RpcQueryOptions;
  }): ClearCacheRpcQuery {
    return new ClearCacheRpcQuery({
      network: this._network,
      query,
      relays,
      options,
    }).run();
  }
}

export { RpcNetwork, RpcQueryBase, SimpleRpcQuery };
