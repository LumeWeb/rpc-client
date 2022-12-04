import b4a from "b4a";
import { isPromise, validateTimestampedResponse, } from "../util.js";
import RPC from "@lumeweb/rpc";
import { ERR_INVALID_SIGNATURE } from "../error.js";
import RpcQueryBase from "./base.js";
export default class SimpleRpcQuery extends RpcQueryBase {
    _relay;
    constructor(network, relay, query, options) {
        super(network, query, options);
        this._relay = relay;
    }
    async _run() {
        await this.queryRelay();
        await this.checkResponses();
    }
    async queryRelay() {
        let socket;
        try {
            socket = this._network.dht.connect(b4a.from(this._relay, "hex"));
            if (isPromise(socket)) {
                socket = await socket;
            }
        }
        catch (e) {
            return;
        }
        await socket.opened;
        const rpc = new RPC(socket);
        try {
            await this.queryRpc(rpc, this._query);
        }
        catch (e) {
            // @ts-ignore
            rpc.end();
            throw e;
        }
        // @ts-ignore
        rpc.end();
    }
    async checkResponses() {
        let response = this._response;
        if (this._error) {
            response = { error: this._error };
        }
        if (!response.error &&
            !validateTimestampedResponse(b4a.from(this._relay, "hex"), response)) {
            response = { error: ERR_INVALID_SIGNATURE };
        }
        this.resolve(response);
    }
}
