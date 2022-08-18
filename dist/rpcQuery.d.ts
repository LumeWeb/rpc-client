import RpcNetwork from "./rpcNetwork.js";
import { RPCRequest } from "./types.js";
export default class RpcQuery {
  private _network;
  private _query;
  private _promise?;
  private _timeoutTimer?;
  private _timeout;
  private _completed;
  private _responses;
  private _promiseResolve?;
  private _maxTries;
  private _tries;
  constructor(network: RpcNetwork, query: RPCRequest);
  get result(): Promise<any>;
  private handeTimeout;
  private resolve;
  private init;
  private queryRelay;
  private checkResponses;
  private retry;
}
//# sourceMappingURL=rpcQuery.d.ts.map
