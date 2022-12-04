import SimpleRpcQuery from "./query/simple.js";
import WisdomRpcQuery from "./query/wisdom.js";
import { RpcQueryOptions } from "./types.js";
export default class RpcNetwork {
  constructor(dht?: any);
  private _dht;
  get dht(): any;
  private _majorityThreshold;
  get majorityThreshold(): number;
  set majorityThreshold(value: number);
  private _queryTimeout;
  get queryTimeout(): number;
  set queryTimeout(value: number);
  private _relayTimeout;
  get relayTimeout(): number;
  set relayTimeout(value: number);
  private _relays;
  get relays(): string[];
  private _ready?;
  get ready(): Promise<void>;
  private _bypassCache;
  get bypassCache(): boolean;
  set bypassCache(value: boolean);
  private _maxRelays;
  get maxRelays(): number;
  set maxRelays(value: number);
  addRelay(pubkey: string): void;
  removeRelay(pubkey: string): boolean;
  clearRelays(): void;
  wisdomQuery(
    method: string,
    module: string,
    data?: object | any[],
    bypassCache?: boolean,
    options?: {}
  ): WisdomRpcQuery;
  simpleQuery(
    relay: string,
    method: string,
    module: string,
    data?: object | any[],
    bypassCache?: boolean,
    options?: RpcQueryOptions
  ): SimpleRpcQuery;
  clearCacheQuery(
    relays: string[],
    method: string,
    module: string,
    data?: object | any[],
    options?: RpcQueryOptions
  ): SimpleRpcQuery;
}
//# sourceMappingURL=network.d.ts.map
