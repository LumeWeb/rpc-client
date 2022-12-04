/// <reference types="node" />
import type { RPCResponse } from "@lumeweb/relay-types";
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
//# sourceMappingURL=util.d.ts.map
