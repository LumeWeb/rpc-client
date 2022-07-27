import RpcQuery from "./rpcQuery.js";
// @ts-ignore
import DHT from "@hyperswarm/dht";

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

  private _maxTtl = 12 * 60 * 60;

  get maxTtl(): number {
    return this._maxTtl;
  }

  set maxTtl(value: number) {
    this._maxTtl = value;
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

  private _force: boolean = false;

  get force(): boolean {
    return this._force;
  }

  set force(value: boolean) {
    this._force = value;
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

  public query(
    query: string,
    chain: string,
    data: object | any[] = {},
    force: boolean = false
  ): RpcQuery {
    return new RpcQuery(this, {
      query,
      chain,
      data,
      force: force || this._force,
    });
  }
}
