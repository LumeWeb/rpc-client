/// <reference types="node" />
import RpcQueryBase from "./base.js";
import RpcNetwork from "../network.js";
import type { RPCRequest } from "@lumeweb/relay";
import { RpcQueryOptions } from "../types.js";
import type { Buffer } from "buffer";
export default class SimpleRpcQuery extends RpcQueryBase {
  private _relay;
  constructor(
    network: RpcNetwork,
    relay: string | Buffer,
    query: RPCRequest,
    options: RpcQueryOptions
  );
  protected checkResponses(): void;
  protected getRelays(): string[] | Buffer[];
}
//# sourceMappingURL=simple.d.ts.map
