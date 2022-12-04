import { hashQuery } from "../util.js";
import { getActiveRelay, setupRelay } from "../sharedRelay.js";
import SimpleRpcQuery from "./simple.js";
export default class ClearCacheRpcQuery extends SimpleRpcQuery {
    _relays;
    constructor(network, relays, query, options) {
        super(network, "", query, options);
        this._relays = relays;
    }
    async _run() {
        await setupRelay(this._network);
        // @ts-ignore
        this._relay = getActiveRelay().stream.remotePublicKey;
        await this.queryRelay();
        await this.checkResponses();
    }
    async queryRelay() {
        return this.queryRpc(getActiveRelay(), {
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
