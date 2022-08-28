/// <reference types="node" />
import { Buffer } from "buffer";
import RpcNetwork from "../network.js";
import { RpcQueryOptions } from "../types.js";
import type { RPCRequest, RPCResponse } from "@lumeweb/relay";
export default abstract class RpcQueryBase {
  protected _network: RpcNetwork;
  protected _query: RPCRequest;
  protected _options: RpcQueryOptions;
  protected _promise?: Promise<any>;
  protected _timeoutTimer?: any;
  protected _timeout: boolean;
  protected _completed: boolean;
  protected _responses: {
    [relay: string]: RPCResponse;
  };
  protected _errors: {
    [relay: string]: any;
  };
  protected _promiseResolve?: (data: any) => void;
  constructor(
    network: RpcNetwork,
    query: RPCRequest,
    options?: RpcQueryOptions
  );
  get result(): Promise<RPCResponse>;
  private handeTimeout;
  protected resolve(data?: RPCResponse, timeout?: boolean): void;
  run(): this;
  protected queryRelay(relay: string | Buffer): Promise<any>;
  protected abstract checkResponses(): void;
  protected abstract getRelays(): string[] | Buffer[];
}
//# sourceMappingURL=base.d.ts.map
