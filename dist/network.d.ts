/// <reference types="node" />
import WisdomRpcQuery from "./query/wisdom.js";
import StreamingRpcQuery from "./query/streaming.js";
import { RpcQueryOptions, StreamHandlerFunction } from "./types.js";
import SimpleRpcQuery from "./query/simple.js";
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
  addRelay(pubkey: string): void;
  removeRelay(pubkey: string): boolean;
  clearRelays(): void;
  wisdomQuery(
    method: string,
    module: string,
    data?: object | any[],
    bypassCache?: boolean,
    options?: RpcQueryOptions
  ): WisdomRpcQuery;
  streamingQuery(
    relay: Buffer | string,
    method: string,
    module: string,
    streamHandler: StreamHandlerFunction,
    data?: object | any[],
    options?: RpcQueryOptions
  ): StreamingRpcQuery;
  simpleQuery(
    relay: Buffer | string,
    method: string,
    module: string,
    data?: object | any[],
    options?: RpcQueryOptions
  ): SimpleRpcQuery;
}
//# sourceMappingURL=network.d.ts.map
