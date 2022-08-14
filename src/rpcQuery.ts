import { clearTimeout, setTimeout } from "timers";
import RpcNetwork from "./rpcNetwork.js";
import { pack, unpack } from "msgpackr";
import { RPCRequest, RPCResponse } from "./types";
import { Buffer } from "buffer";
import { blake2b } from "libskynet";
import { flatten } from "./util.js";

export default class RpcQuery {
  private _network: RpcNetwork;
  private _query: RPCRequest;
  private _promise?: Promise<any>;
  private _timeoutTimer?: any;
  private _timeout: boolean = false;
  private _completed: boolean = false;
  private _responses: { [relay: string]: RPCResponse } = {};
  private _promiseResolve?: (data: any) => void;
  private _maxTries = 3;
  private _tries = 0;

  constructor(network: RpcNetwork, query: RPCRequest) {
    this._network = network;
    this._query = query;
    this.init();
  }

  get result(): Promise<any> {
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
    let socket: any;

    try {
      socket = this._network.dht.connect(Buffer.from(relay, "hex"));
      if (isPromise(socket)) {
        socket = await socket;
      }
    } catch (e) {
      return;
    }
    return new Promise((resolve, reject) => {
      let timer: NodeJS.Timeout;
      socket.on("data", (res: Buffer) => {
        clearTimeout(timer);
        socket.end();
        const response = unpack(res);
        if (response && response.error) {
          return reject(response);
        }
        this._responses[relay] = response;
        resolve(null);
      });
      socket.on("error", (error: any) => reject({ error }));
      socket.write("rpc");
      socket.write(pack(this._query));
      timer = setTimeout(() => {
        reject("timeout");
      }, this._network.relayTimeout * 1000) as NodeJS.Timeout;
    });
  }

  private checkResponses() {
    const responseStore = this._responses;
    const responseStoreData = Object.values(responseStore);

    type ResponseGroup = { [response: string]: number };

    const responseObjects = responseStoreData.reduce((output: any, item) => {
      const itemFlattened = flatten(item?.data).sort();

      const hash = Buffer.from(
        blake2b(Buffer.from(JSON.stringify(itemFlattened)))
      ).toString("hex");
      output[hash] = item?.data;
      return output;
    }, {});
    const responses: ResponseGroup = responseStoreData.reduce(
      (output: ResponseGroup, item) => {
        const itemFlattened = flatten(item?.data).sort();
        const hash = Buffer.from(
          blake2b(Buffer.from(JSON.stringify(itemFlattened)))
        ).toString("hex");
        output[hash] = output[hash] ?? 0;
        output[hash]++;
        return output;
      },
      {}
    );

    for (const responseHash in responses) {
      if (
        responses[responseHash] / responseStoreData.length >=
        this._network.majorityThreshold
      ) {
        // @ts-ignore
        let response: RPCResponse | boolean = responseObjects[responseHash];

        // @ts-ignore
        if (null === response) {
          if (this._tries <= this._maxTries) {
            this._tries++;
            this.retry();
            return;
          }

          response = false;
        }

        this.resolve(response);
        break;
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

function isPromise(obj: Promise<any>) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}
