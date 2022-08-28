import RpcQueryBase from "./base.js";
export default class WisdomRpcQuery extends RpcQueryBase {
  private _maxTries;
  private _tries;
  protected checkResponses(): void;
  private retry;
  protected getRelays(): string[] | [];
}
//# sourceMappingURL=wisdom.d.ts.map
