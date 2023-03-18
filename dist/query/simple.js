import b4a from "b4a";
import { hashQuery, isPromise, validateTimestampedResponse } from "../util.js";
import RPC from "@lumeweb/rpc";
import { ERR_INVALID_SIGNATURE } from "../error.js";
import RpcQueryBase from "./base.js";
export default class SimpleRpcQuery extends RpcQueryBase {
    _relay;
    constructor({ network, relay, query, options, }) {
        super({ network, query, options });
        if (b4a.isBuffer(relay)) {
            relay = b4a.from(relay).toString("hex");
        }
        this._relay = relay;
    }
    async _run() {
        await this.queryRelay();
        await this.checkResponses();
    }
    async queryRelay() {
        let socket = this._relay;
        if (socket) {
            if (socket === "string") {
                try {
                    const relay = this._network.getRelay(socket);
                    if (this._network.getRelay(socket)) {
                        socket = relay;
                    }
                }
                catch { }
            }
            if (socket === "string") {
                try {
                    socket = this._network.swarm.connect(b4a.from(this._relay, "hex"));
                    if (isPromise(socket)) {
                        socket = await socket;
                    }
                }
                catch { }
            }
        }
        if (!socket) {
            socket = this._network.getAvailableRelay(this._query.module, this._query.method);
        }
        this._relay = socket;
        await socket.opened;
        const rpc = new RPC(socket);
        if (this._query.bypassCache) {
            delete this._query.bypassCache;
            await this.queryRpc(rpc, {
                module: "rpc",
                method: "clear_cached_item",
                data: hashQuery(this._query),
            });
        }
        if ("bypassCache" in this._query) {
            delete this._query.bypassCache;
        }
        try {
            await this.queryRpc(rpc, this._query);
        }
        catch (e) {
            throw e;
        }
    }
    async checkResponses() {
        let response = this._response;
        if (this._error) {
            response = { error: this._error };
        }
        if (!response.error &&
            !validateTimestampedResponse(b4a.from(this._relay.remotePublicKey, "hex"), response)) {
            response = { error: ERR_INVALID_SIGNATURE };
        }
        this.resolve(response);
    }
}
