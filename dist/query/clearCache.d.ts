import RpcNetwork from "../network.js";
import { RPCRequest } from "@lumeweb/relay-types";
import { RpcQueryOptions } from "../types.js";
import SimpleRpcQuery from "./simple.js";
export default class ClearCacheRpcQuery extends SimpleRpcQuery {
  protected _relays: string[];
  constructor(
    network: RpcNetwork,
    relays: string[],
    query: RPCRequest,
    options: RpcQueryOptions
  );
  protected _run(): Promise<void>;
  protected queryRelay(): Promise<any>;
}
//# sourceMappingURL=clearCache.d.ts.map
