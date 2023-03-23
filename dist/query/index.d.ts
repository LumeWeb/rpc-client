/// <reference types="node" />
import { ClientRPCRequest, RPCRequest } from "@lumeweb/interface-relay";
import { RpcQueryOptions } from "../types.js";
import SimpleRpcQuery from "./simple.js";
import ClearCacheRpcQuery from "./clearCache.js";
import RpcNetwork from "../network.js";
import RpcQueryBase from "./base.js";
export default class RpcNetworkQueryFactory {
  private _network;
  constructor(network: RpcNetwork);
  simple({
    relay,
    query,
    options,
  }: {
    relay?: string | Buffer;
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
export { RpcNetwork, RpcQueryBase, SimpleRpcQuery };
//# sourceMappingURL=index.d.ts.map
