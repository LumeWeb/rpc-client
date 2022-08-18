import RpcQuery from "./rpcQuery.js";
export default class RpcNetwork {
  constructor(dht?: any);
  private _dht;
  get dht(): any;
  private _majorityThreshold;
  get majorityThreshold(): number;
  set majorityThreshold(value: number);
  private _maxTtl;
  get maxTtl(): number;
  set maxTtl(value: number);
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
  addRelay(pubkey: string): void;
  removeRelay(pubkey: string): boolean;
  clearRelays(): void;
  query(
    query: string,
    chain: string,
    data?: object | any[],
    bypassCache?: boolean
  ): RpcQuery;
}
//# sourceMappingURL=rpcNetwork.d.ts.map
