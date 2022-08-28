import WisdomRpcQuery from "./query/wisdom.js";
// @ts-ignore
import DHT from "@hyperswarm/dht";
import StreamingRpcQuery from "./query/streaming.js";
import { RpcQueryOptions, StreamHandlerFunction } from "./types.js";
import SimpleRpcQuery from "./query/simple.js";

export default class RpcNetwork {
  constructor(dht = new DHT()) {
    this._dht = dht;
  }

  private _dht: typeof DHT;

  get dht() {
    return this._dht;
  }

  private _majorityThreshold = 0.75;

  get majorityThreshold(): number {
    return this._majorityThreshold;
  }

  set majorityThreshold(value: number) {
    this._majorityThreshold = value;
  }

  private _queryTimeout = 30;

  get queryTimeout(): number {
    return this._queryTimeout;
  }

  set queryTimeout(value: number) {
    this._queryTimeout = value;
  }

  private _relayTimeout = 2;

  get relayTimeout(): number {
    return this._relayTimeout;
  }

  set relayTimeout(value: number) {
    this._relayTimeout = value;
  }

  private _relays: string[] = [];

  get relays(): string[] {
    return this._relays;
  }

  private _ready?: Promise<void>;

  get ready(): Promise<void> {
    if (!this._ready) {
      this._ready = this._dht.ready() as Promise<void>;
    }
    return this._ready;
  }

  private _bypassCache: boolean = false;

  get bypassCache(): boolean {
    return this._bypassCache;
  }

  set bypassCache(value: boolean) {
    this._bypassCache = value;
  }

  public addRelay(pubkey: string): void {
    this._relays.push(pubkey);
    this._relays = [...new Set(this._relays)];
  }

  public removeRelay(pubkey: string): boolean {
    if (!this._relays.includes(pubkey)) {
      return false;
    }

    delete this._relays[this._relays.indexOf(pubkey)];
    this._relays = Object.values(this._relays);

    return true;
  }

  public clearRelays(): void {
    this._relays = [];
  }

  public wisdomQuery(
    method: string,
    module: string,
    data: object | any[] = {},
    bypassCache: boolean = false,
    options: RpcQueryOptions = {}
  ): WisdomRpcQuery {
    return new WisdomRpcQuery(
      this,
      {
        method,
        module,
        data,
        bypassCache: bypassCache || this._bypassCache,
      },
      options
    ).run();
  }

  public streamingQuery(
    relay: Buffer | string,
    method: string,
    module: string,
    streamHandler: StreamHandlerFunction,
    data: object | any[] = {},
    options: RpcQueryOptions = {}
  ): StreamingRpcQuery {
    return new StreamingRpcQuery(
      this,
      relay,
      { method, module, data },
      { streamHandler, ...options }
    ).run();
  }

  public simpleQuery(
    relay: Buffer | string,
    method: string,
    module: string,
    data: object | any[] = {},
    options: RpcQueryOptions = {}
  ): SimpleRpcQuery {
    return new SimpleRpcQuery(
      this,
      relay,
      {
        method,
        module,
        data,
      },
      options
    ).run();
  }
}
