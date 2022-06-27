// tslint:disable:no-var-requires
import { createRequire } from "module";
import RpcQuery from "./rpcQuery.js";

const require = createRequire(import.meta.url);

const DHT = require("@hyperswarm/dht");

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
    this._ready = this._dht.ready()
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
