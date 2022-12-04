import { ClientRPCRequest, RPCRequest } from "@lumeweb/relay-types";
import { RpcQueryOptions } from "../types.js";
import WisdomRpcQuery from "./wisdom.js";
import SimpleRpcQuery from "./simple.js";
import ClearCacheRpcQuery from "./clearCache.js";
import RpcNetwork from "../network.js";
import RpcQueryBase from "./base.js";
export default class RpcNetworkQueryFactory {
  private _network;
  constructor(network: RpcNetwork);
  wisdom({
    query,
    options,
  }: {
    query: ClientRPCRequest;
    options?: RpcQueryOptions;
  }): WisdomRpcQuery;
  simple({
    relay,
    query,
    options,
  }: {
    relay: string;
    query: ClientRPCRequest;
    options?: RpcQueryOptions;
  }): SimpleRpcQuery;
  clearCache({
    relays,
    query,
    options,
  }: {
    relays: string[];
    query: RPCRequest;
    options?: RpcQueryOptions;
  }): ClearCacheRpcQuery;
}
export { RpcNetwork, RpcQueryBase, SimpleRpcQuery, WisdomRpcQuery };
//# sourceMappingURL=index.d.ts.map
