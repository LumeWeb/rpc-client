/// <reference types="node" />
import RpcNetwork from "../network.js";
import { ClientRPCRequest } from "@lumeweb/relay-types";
import { RpcQueryOptions } from "../types.js";
import RpcQueryBase from "./base.js";
export default class SimpleRpcQuery extends RpcQueryBase {
  protected _relay?: string | any;
  protected _query: ClientRPCRequest;
  constructor({
    network,
    relay,
    query,
    options,
  }: {
    network: RpcNetwork;
    relay?: string | Buffer | any;
    query: ClientRPCRequest;
    options: RpcQueryOptions;
  });
  protected _run(): Promise<void>;
  protected queryRelay(): Promise<any>;
  protected checkResponses(): Promise<void>;
}
//# sourceMappingURL=simple.d.ts.map
