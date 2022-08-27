import { clearTimeout, setTimeout } from "timers";
import { pack, unpack } from "msgpackr";
import { Buffer } from "buffer";
import { isPromise } from "../util.js";
import RpcNetwork from "../network.js";
import { RpcQueryOptions } from "../types.js";
import type { RPCRequest, RPCResponse } from "@lumeweb/relay";

export default abstract class RpcQueryBase {
  protected _network: RpcNetwork;
  protected _query: RPCRequest;
  protected _options: RpcQueryOptions;

  protected _promise?: Promise<any>;
  protected _timeoutTimer?: any;
  protected _timeout: boolean = false;
  protected _completed: boolean = false;
  protected _responses: { [relay: string]: RPCResponse } = {};
  protected _errors: { [relay: string]: any } = {};
  protected _promiseResolve?: (data: any) => void;

  constructor(
    network: RpcNetwork,
    query: RPCRequest,
    options: RpcQueryOptions = {}
  ) {
    this._network = network;
    this._query = query;
    this._options = options;
    this.init();
  }

  get result(): Promise<RPCResponse> {
    return this._promise as Promise<RPCResponse>;
  }

  private handeTimeout() {
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

  protected async init() {
    this._promise =
      this._promise ??
      new Promise<any>((resolve) => {
        this._promiseResolve = resolve;
      });

    this._timeoutTimer =
      this._timeoutTimer ??
      setTimeout(
        this.handeTimeout.bind(this),
        (this._options.queryTimeout || this._network.queryTimeout) * 1000
      );

    await this._network.ready;

    const promises = [];

    for (const relay of this.getRelays()) {
      promises.push(this.queryRelay(relay));
    }

    await Promise.allSettled(promises);
    this.checkResponses();
  }

  protected async queryRelay(relay: string | Buffer): Promise<any> {
    let socket: any;

    let relayKey: Buffer = relay as Buffer;

    if (relay === "string") {
      relayKey = Buffer.from(relay, "hex");
    }
    if (relay instanceof Buffer) {
      relayKey = relay;
      relay = relay.toString("hex");
    }

    try {
      socket = this._network.dht.connect(relayKey);
      if (isPromise(socket)) {
        socket = await socket;
      }
    } catch (e) {
      return;
    }
    return new Promise((resolve, reject) => {
      let timer: any;
      socket.on("data", (res: Buffer) => {
        relay = relay as string;
        if (timer && timer.close) {
          clearTimeout(timer as any);
        }
        socket.end();
        const response = unpack(res as any) as RPCResponse;
        if (response && response.error) {
          this._errors[relay] = response.error;
          return reject(null);
        }
        this._responses[relay] = response;
        resolve(null);
      });
      socket.on("error", (error: any) => {
        relay = relay as string;
        this._errors[relay] = error;
        reject({ error });
      });
      socket.write("rpc");
      socket.write(pack(this._query));
      timer = setTimeout(() => {
        this._errors[relay as string] = "timeout";
        reject(null);
      }, (this._options.relayTimeout || this._network.relayTimeout) * 1000) as NodeJS.Timeout;
    });
  }

  protected abstract checkResponses(): void;

  protected abstract getRelays(): string[] | Buffer[];
}
