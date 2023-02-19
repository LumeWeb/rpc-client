// @ts-ignore
import DHT from "@hyperswarm/dht";
import RpcNetworkQueryFactory from "./query/index.js";

export default class RpcNetwork {
  constructor(dht = new DHT()) {
    this._dht = dht;
  }

  private _factory = new RpcNetworkQueryFactory(this);

  get factory(): RpcNetworkQueryFactory {
    return this._factory;
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

  private _maxRelays: number = 0;

  get maxRelays(): number {
    return this._maxRelays;
  }

  set maxRelays(value: number) {
    this._maxRelays = value;
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
}
