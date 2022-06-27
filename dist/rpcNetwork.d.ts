import RpcQuery from "./rpcQuery.js";
export default class RpcNetwork {
    private _dht;
    private _majorityThreshold;
    private _maxTtl;
    private _queryTimeout;
    private _relays;
    private _ready;
    private _force;
    constructor(dht?: any);
    get ready(): Promise<void>;
    get relays(): string[];
    get dht(): any;
    get maxTtl(): number;
    set maxTtl(value: number);
    get queryTimeout(): number;
    set queryTimeout(value: number);
    get majorityThreshold(): number;
    set majorityThreshold(value: number);
    get force(): boolean;
    set force(value: boolean);
    addRelay(pubkey: string): void;
    removeRelay(pubkey: string): boolean;
    clearRelays(): void;
    query(query: string, chain: string, data?: object | any[], force?: boolean): RpcQuery;
}
//# sourceMappingURL=rpcNetwork.d.ts.map