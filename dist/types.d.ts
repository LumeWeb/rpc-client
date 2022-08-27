export interface RpcQueryOptions {
  queryTimeout?: number;
  relayTimeout?: number;
}
export interface StreamingRpcQueryOptions extends RpcQueryOptions {
  streamHandler: StreamHandlerFunction;
}
export declare type StreamHandlerFunction = (data: Uint8Array) => void;
//# sourceMappingURL=types.d.ts.map
