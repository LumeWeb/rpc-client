import { ClientRPCRequest, RPCRequest } from "@lumeweb/relay-types";
import { RpcQueryOptions } from "../types.js";
import WisdomRpcQuery from "./wisdom.js";
import SimpleRpcQuery from "./simple.js";
import ClearCacheRpcQuery from "./clearCache.js";
import RpcNetwork from "../network.js";
import RpcQueryBase from "./base.js";

export default class RpcNetworkQueryFactory {
  private _network: RpcNetwork;

  constructor(network: RpcNetwork) {
    this._network = network;
  }

  wisdom({
    query,
    options = {},
  }: {
    query: ClientRPCRequest;
    options?: RpcQueryOptions;
  }): WisdomRpcQuery {
    return new WisdomRpcQuery(
      this._network,
      {
        ...query,
        bypassCache: query.bypassCache || this._network.bypassCache,
      },
      options
    ).run();
  }

  simple({
    relay,
    query,
    options = {},
  }: {
    relay: string;
    query: ClientRPCRequest;
    options?: RpcQueryOptions;
  }): SimpleRpcQuery {
    return new SimpleRpcQuery(
      this._network,
      relay,
      {
        ...query,
        bypassCache: query.bypassCache || this._network.bypassCache,
      },
      options
    ).run();
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
    return new ClearCacheRpcQuery(this._network, relays, query, options).run();
  }
}

export { RpcNetwork, RpcQueryBase, SimpleRpcQuery, WisdomRpcQuery };
