export interface RPCRequest {
  force: boolean;
  chain: string;
  query: string;
  data: any;
}

export interface RPCResponse {
  updated: number;
  data:
    | any
    | {
        error: string | boolean;
      };
}
