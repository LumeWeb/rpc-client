import { clearTimeout, setTimeout } from "timers";
import RpcNetwork from "./rpcNetwork.js";
import { pack, unpack } from "msgpackr";
import {RPCRequest, RPCResponse} from "./types";

export default class RpcQuery {
  private _network: RpcNetwork;
  private _query: RPCRequest;
  private _promise?: Promise<any>;
  private _timeoutTimer?: any;
  private _timeout: boolean = false;
  private _completed: boolean = false;
  private _responses: { [relay: string]: RPCResponse } = {};
  private _promiseResolve?: (data: any) => void;

  constructor(network: RpcNetwork, query: RPCRequest) {
    this._network = network;
    this._query = query;
    this.init();
  }

  get promise(): Promise<any> {
    return this._promise as Promise<any>;
  }

  private handeTimeout() {
    this.resolve(false, true);
  }

  private resolve(data: any, timeout: boolean = false): void {
    clearTimeout(this._timeoutTimer);
    this._timeout = timeout;
    this._completed = true;
    // @ts-ignore
    this._promiseResolve(data);
  }

  private async init() {
    this._promise =
      this._promise ??
      new Promise<any>((resolve) => {
        this._promiseResolve = resolve;
      });

        this._timeoutTimer =
      this._timeoutTimer ??
      setTimeout(
        this.handeTimeout.bind(this),
        this._network.queryTimeout * 1000
      );

    await this._network.ready;

    const promises = [];

    // tslint:disable-next-line:forin
    for (const relay of this._network.relays) {
      promises.push(this.queryRelay(relay));
    }

    await Promise.allSettled(promises);
    this.checkResponses();
  }

  private async queryRelay(relay: string): Promise<any> {
    const socket = this._network.dht.connect(Buffer.from(relay, "hex"));
    return new Promise((resolve, reject) => {
      socket.on("data", (res: Buffer) => {
        socket.end();
        const response = unpack(res);
        if (response && response.error) {
          return reject(response);
        }
        this._responses[relay] = response;
        resolve(null);
      });
      socket.on("error", (error: any) => reject({ error }));
      socket.write(pack(this._query));
    });
  }

  private checkResponses() {
    const responses: { [response: string]: number } = {};
    const responseStore = this._responses;

    const responseStoreKeys = Object.keys(responseStore);

    // tslint:disable-next-line:forin
    for (const peer in responseStore) {
      const responseIndex = responseStoreKeys.indexOf(peer);

      responses[responseIndex] = responses[responseIndex] ?? 0;
      responses[responseIndex]++;
    }
    for (const responseIndex in responses) {
      if (responses[responseIndex] / responseStoreKeys.length >= this._network.majorityThreshold) {
        const response: RPCResponse | null =
          responseStore[responseStoreKeys[parseInt(responseIndex, 10)]];

        // @ts-ignore
        if (null === response || null === response?.data) {
          this.retry();
          return;
        }

        this.resolve(response?.data);
      }
    }
  }

  private retry() {
    this._responses = {};

    if (this._completed) {
      return;
    }

    this.init();
  }
}
