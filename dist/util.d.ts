/// <reference types="node" />
import type { RPCRequest, RPCResponse } from "@lumeweb/interface-relay";
export declare const RPC_PROTOCOL_SYMBOL: unique symbol;
export declare function isPromise(obj: Promise<any>): boolean;
export declare function flatten(target: any, opts?: any): any[];
export declare function validateResponse(
  relay: Buffer,
  response: RPCResponse,
  timestamped?: boolean
): boolean;
export declare function validateTimestampedResponse(
  relay: Buffer,
  response: RPCResponse
): boolean;
export declare function hashQuery(query: RPCRequest): string;
export declare function createHash(data: string): Buffer;
export declare function setupStream(stream: any): any;
//# sourceMappingURL=util.d.ts.map
