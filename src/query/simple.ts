import RpcQueryBase from "./base.js";
import RpcNetwork from "../rpcNetwork.js";
import type { RPCRequest } from "@lumeweb/relay";
import { RpcQueryOptions } from "../types.js";
import type { Buffer } from "buffer";

export default class SimpleRpcQuery extends RpcQueryBase {
  private _relay: string | Buffer;
  constructor(
    network: RpcNetwork,
    relay: string | Buffer,
    query: RPCRequest,
    options: RpcQueryOptions
  ) {
    super(network, query, options);
    this._relay = relay;
    this.init();
  }

  protected checkResponses(): void {
    if (Object.keys(this._responses).length) {
      this.resolve(Object.values(this._responses).pop());
      return;
    }

    if (Object.keys(this._errors).length) {
      this.resolve({ error: Object.values(this._errors).pop() });
      return;
    }
  }

  protected getRelays(): string[] | Buffer[] {
    return [this._relay] as string[] | Buffer[];
  }
}
