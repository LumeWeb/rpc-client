import SimpleRpcQuery from "./simple.js";
import { Buffer } from "buffer";
import { isPromise } from "../util.js";
import { clearTimeout, setTimeout } from "timers";
import { pack, unpack } from "msgpackr";
import type { RPCRequest, RPCResponse } from "@lumeweb/relay-types";
import RpcNetwork from "../network.js";
import { StreamingRpcQueryOptions } from "../types.js";

export default class StreamingRpcQuery extends SimpleRpcQuery {
  protected _options: StreamingRpcQueryOptions;
  constructor(
    network: RpcNetwork,
    relay: string | Buffer,
    query: RPCRequest,
    options: StreamingRpcQueryOptions
  ) {
    super(network, relay, query, options);
    this._options = options;
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

        if (response?.data.done) {
          this._responses[relay] = {};
          resolve(null);
          return;
        }

        this._options.streamHandler(response?.data.data);
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
}