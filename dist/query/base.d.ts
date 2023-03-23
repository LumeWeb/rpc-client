/// <reference types="node" />
import RpcNetwork from "../network.js";
import { RpcQueryOptions } from "../types.js";
import type {
  ClientRPCRequest,
  RPCRequest,
  RPCResponse,
} from "@lumeweb/interface-relay";
export default abstract class RpcQueryBase {
  protected _network: RpcNetwork;
  protected _query: RPCRequest;
  protected _options: RpcQueryOptions;
  protected _promise?: Promise<any>;
  protected _timeoutTimer?: any;
  protected _timeout: boolean;
  protected _completed: boolean;
  protected _response?: RPCResponse;
  protected _error?: string;
  protected _promiseResolve?: (data: any) => void;
  constructor({
    network,
    query,
    options,
  }: {
    network: RpcNetwork;
    query: ClientRPCRequest | RPCRequest;
    options: RpcQueryOptions;
  });
  get result(): Promise<RPCResponse>;
  protected handeTimeout(): void;
  protected resolve(data?: RPCResponse, timeout?: boolean): void;
  run(): this;
  private _doRun;
  protected setupRelayTimeout(reject: Function): NodeJS.Timeout;
  protected abstract _run(): void;
  protected queryRpc(rpc: any, request: RPCRequest): Promise<unknown>;
}
//# sourceMappingURL=base.d.ts.map
