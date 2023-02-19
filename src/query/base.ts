import { clearTimeout, setTimeout } from "timers";
import RpcNetwork from "../network.js";
import { RpcQueryOptions } from "../types.js";
import type {
  ClientRPCRequest,
  RPCRequest,
  RPCResponse,
} from "@lumeweb/relay-types";

export default abstract class RpcQueryBase {
  protected _network: RpcNetwork;
  protected _query: RPCRequest;
  protected _options: RpcQueryOptions;

  protected _promise?: Promise<any>;
  protected _timeoutTimer?: any;
  protected _timeout: boolean = false;
  protected _completed: boolean = false;
  protected _response?: RPCResponse;
  protected _error?: string;
  protected _promiseResolve?: (data: any) => void;

  constructor(
    network: RpcNetwork,
    query: ClientRPCRequest | RPCRequest,
    options: RpcQueryOptions = {}
  ) {
    this._network = network;
    this._query = query;
    this._options = options;
  }

  get result(): Promise<RPCResponse> {
    return this._promise as Promise<RPCResponse>;
  }

  protected handeTimeout() {
    this.resolve(undefined, true);
  }

  protected resolve(data?: RPCResponse, timeout: boolean = false): void {
    clearTimeout(this._timeoutTimer);
    this._timeout = timeout;
    this._completed = true;

    if (timeout) {
      data = {
        error: "timeout",
      };
    }

    this._promiseResolve?.(data);
  }

  public run(): this {
    this._promise =
      this._promise ??
      new Promise<any>((resolve) => {
        this._promiseResolve = resolve;
      });

    this._timeoutTimer =
      this._timeoutTimer ??
      setTimeout(
        this.handeTimeout.bind(this),
        (this._options?.queryTimeout || this._network.queryTimeout) * 1000
      );

    this._doRun();

    return this;
  }

  private async _doRun() {
    try {
      await this._network.ready;
      await this._run();
    } catch (e: any) {
      this._promiseResolve?.({ error: e?.message || e?.error });
    }
  }

  protected setupRelayTimeout(reject: Function): NodeJS.Timeout {
    return setTimeout(() => {
      this._error = "timeout";
      reject("timeout");
    }, (this._options.relayTimeout || this._network.relayTimeout) * 1000) as NodeJS.Timeout;
  }

  protected abstract _run(): void;

  protected async queryRpc(rpc: any, request: RPCRequest) {
    let timer: NodeJS.Timeout;

    return new Promise((resolve, reject) => {
      rpc
        // @ts-ignore
        .request(`${request.module}.${request.method}`, request.data)
        .then((resp: any) => {
          if (resp.error) {
            throw new Error(resp.error);
          }
          clearTimeout(timer as any);

          this._response = resp;
          resolve(null);
        })
        .catch((e: Error) => {
          this._error = e.message;
          reject({ error: e.message });
          clearTimeout(timer as any);
        });

      timer = this.setupRelayTimeout(reject);
    });
  }
}
