import { hashQuery } from "../util.js";
import SimpleRpcQuery from "./simple.js";
export default class ClearCacheRpcQuery extends SimpleRpcQuery {
    _relays;
    constructor({ network, relays, query, options, }) {
        super({ network, relay: "", query, options });
        this._relays = relays;
    }
    async _run() {
        // @ts-ignore
        this._relay = getActiveRelay().stream.remotePublicKey;
        await this.queryRelay();
        await this.checkResponses();
    }
    async queryRelay() {
        return this.queryRpc(this._network.getAvailableRelay("rpc", "broadcast_request"), {
            module: "rpc",
            method: "broadcast_request",
            data: {
                request: {
                    module: "rpc",
                    method: "clear_cached_item",
                    data: hashQuery(this._query),
                },
                relays: this._relays,
            },
        });
    }
}
