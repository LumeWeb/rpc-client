/// <reference types="node" />
import SimpleRpcQuery from "./simple.js";
import { Buffer } from "buffer";
import type { RPCRequest } from "@lumeweb/relay";
import RpcNetwork from "../network.js";
import { StreamingRpcQueryOptions } from "../types.js";
export default class StreamingRpcQuery extends SimpleRpcQuery {
  protected _options: StreamingRpcQueryOptions;
  constructor(
    network: RpcNetwork,
    relay: string | Buffer,
    query: RPCRequest,
    options: StreamingRpcQueryOptions
  );
  protected queryRelay(relay: string | Buffer): Promise<any>;
}
//# sourceMappingURL=streaming.d.ts.map
