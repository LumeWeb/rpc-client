/// <reference types="node" />
import SimpleRpcQuery from "./simple.js";
import { Buffer } from "buffer";
import type { RPCRequest } from "@lumeweb/relay-types";
import RpcNetwork from "../network.js";
import { StreamingRpcQueryOptions } from "../types.js";
export default class StreamingRpcQuery extends SimpleRpcQuery {
  protected _options: StreamingRpcQueryOptions;
  protected _canceled: boolean;
  constructor(
    network: RpcNetwork,
    relay: string | Buffer,
    query: RPCRequest,
    options: StreamingRpcQueryOptions
  );
  cancel(): void;
  protected queryRelay(relay: string | Buffer): Promise<any>;
}
//# sourceMappingURL=streaming.d.ts.map
