import RpcNetworkQueryFactory from "./query/index.js";
export default class RpcNetwork {
  private _relaysAvailablePromise?;
  private _relaysAvailableResolve?;
  constructor(swarm?: any);
  private _methods;
  get methods(): Map<string, Set<string>>;
  private _factory;
  get factory(): RpcNetworkQueryFactory;
  private _swarm;
  get swarm(): any;
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
  get relays(): Map<string, string[]>;
  private _ready?;
  get ready(): Promise<void>;
  get readyWithRelays(): Promise<void>;
  private _bypassCache;
  get bypassCache(): boolean;
  set bypassCache(value: boolean);
  getAvailableRelay(module: string, method: string): any;
  getRelay(pubkey: string): any;
  private init;
  private setupRelayPromise;
}
//# sourceMappingURL=network.d.ts.map
