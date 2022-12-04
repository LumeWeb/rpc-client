import RpcNetwork from "../network.js";
import { ClientRPCRequest } from "@lumeweb/relay-types";
import { RpcQueryOptions } from "../types.js";
import RpcQueryBase from "./base.js";
export default class SimpleRpcQuery extends RpcQueryBase {
  protected _relay: string;
  protected _query: ClientRPCRequest;
  constructor(
    network: RpcNetwork,
    relay: string,
    query: ClientRPCRequest,
    options: RpcQueryOptions
  );
  protected _run(): Promise<void>;
  protected queryRelay(): Promise<any>;
  protected checkResponses(): Promise<void>;
}
//# sourceMappingURL=simple.d.ts.map
