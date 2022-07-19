import RpcQuery from "./rpcQuery.js";
// @ts-ignore
import DHT from "@hyperswarm/dht";

export default class RpcNetwork {
  private _dht: typeof DHT;
  private _majorityThreshold = 0.75;
  private _maxTtl = 12 * 60 * 60;
  private _queryTimeout = 30;
  private _relays: string[] = [];
  private _ready: Promise<void>;
  private _force: boolean = false;

  constructor(dht = new DHT()) {
    this._dht = dht;
    this._ready = this._dht.ready();
  }

  get ready(): Promise<void> {
    return this._ready;
  }

  get relays(): string[] {
    return this._relays;
  }

  get dht() {
    return this._dht;
  }

  get maxTtl(): number {
    return this._maxTtl;
  }

  set maxTtl(value: number) {
    this._maxTtl = value;
  }

  get queryTimeout(): number {
    return this._queryTimeout;
  }

  set queryTimeout(value: number) {
    this._queryTimeout = value;
  }

  get majorityThreshold(): number {
    return this._majorityThreshold;
  }

  set majorityThreshold(value: number) {
    this._majorityThreshold = value;
  }

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
