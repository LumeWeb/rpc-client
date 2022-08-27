export interface RpcQueryOptions {
  queryTimeout?: number;
  relayTimeout?: number;
}
export interface StreamingRpcQueryOptions extends RpcQueryOptions {
  streamHandler: StreamHandlerFunction;
}

export type StreamHandlerFunction = (data: Uint8Array) => void;
