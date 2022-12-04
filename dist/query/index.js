import WisdomRpcQuery from "./wisdom.js";
import SimpleRpcQuery from "./simple.js";
import ClearCacheRpcQuery from "./clearCache.js";
import RpcNetwork from "../network.js";
import RpcQueryBase from "./base.js";
export default class RpcNetworkQueryFactory {
    _network;
    constructor(network) {
        this._network = network;
    }
    wisdom({ query, options = {}, }) {
        return new WisdomRpcQuery(this._network, {
            ...query,
            bypassCache: query.bypassCache || this._network.bypassCache,
        }, options).run();
    }
    simple({ relay, query, options = {}, }) {
        return new SimpleRpcQuery(this._network, relay, {
            ...query,
            bypassCache: query.bypassCache || this._network.bypassCache,
        }, options).run();
    }
    clearCache({ relays, query, options = {}, }) {
        return new ClearCacheRpcQuery(this._network, relays, query, options).run();
    }
}
export { RpcNetwork, RpcQueryBase, SimpleRpcQuery, WisdomRpcQuery };
