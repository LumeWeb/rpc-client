import { RPCBroadcastResponse, RPCResponse } from "@lumeweb/relay-types";
import RpcQueryBase from "./base.js";
export default class WisdomRpcQuery extends RpcQueryBase {
  protected _response?: RPCBroadcastResponse;
  private static _activeRelay;
  static get activeRelay(): any;
  get result(): Promise<RPCResponse>;
  protected _run(): Promise<void>;
  protected resolve(data?: RPCResponse, timeout?: boolean): void;
  protected queryRelay(): Promise<any>;
  protected checkResponse(): Promise<void>;
  protected getRelays(): string[] | [];
  private setupRelay;
}
//# sourceMappingURL=wisdom.d.ts.map
