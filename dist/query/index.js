import SimpleRpcQuery from "./simple.js";
import ClearCacheRpcQuery from "./clearCache.js";
import RpcNetwork from "../network.js";
import RpcQueryBase from "./base.js";
export default class RpcNetworkQueryFactory {
    _network;
    constructor(network) {
        this._network = network;
    }
    simple({ relay, query, options = {}, }) {
        return new SimpleRpcQuery({
            network: this._network,
            relay,
            query: {
                ...query,
                bypassCache: query?.bypassCache || this._network.bypassCache,
            },
            options,
        }).run();
    }
    clearCache({ relays, query, options = {}, }) {
        return new ClearCacheRpcQuery({
            network: this._network,
            query,
            relays,
            options,
        }).run();
    }
}
export { RpcNetwork, RpcQueryBase, SimpleRpcQuery };
