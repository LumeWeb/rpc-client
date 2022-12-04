// @ts-ignore
import DHT from "@hyperswarm/dht";
import SimpleRpcQuery from "./query/simple.js";
import WisdomRpcQuery from "./query/wisdom.js";
import ClearCacheRpcQuery from "./query/clearCache.js";
export default class RpcNetwork {
    constructor(dht = new DHT()) {
        this._dht = dht;
    }
    _dht;
    get dht() {
        return this._dht;
    }
    _majorityThreshold = 0.75;
    get majorityThreshold() {
        return this._majorityThreshold;
    }
    set majorityThreshold(value) {
        this._majorityThreshold = value;
    }
    _queryTimeout = 30;
    get queryTimeout() {
        return this._queryTimeout;
    }
    set queryTimeout(value) {
        this._queryTimeout = value;
    }
    _relayTimeout = 2;
    get relayTimeout() {
        return this._relayTimeout;
    }
    set relayTimeout(value) {
        this._relayTimeout = value;
    }
    _relays = [];
    get relays() {
        return this._relays;
    }
    _ready;
    get ready() {
        if (!this._ready) {
            this._ready = this._dht.ready();
        }
        return this._ready;
    }
    _bypassCache = false;
    get bypassCache() {
        return this._bypassCache;
    }
    set bypassCache(value) {
        this._bypassCache = value;
    }
    _maxRelays = 0;
    get maxRelays() {
        return this._maxRelays;
    }
    set maxRelays(value) {
        this._maxRelays = value;
    }
    addRelay(pubkey) {
        this._relays.push(pubkey);
        this._relays = [...new Set(this._relays)];
    }
    removeRelay(pubkey) {
        if (!this._relays.includes(pubkey)) {
            return false;
        }
        delete this._relays[this._relays.indexOf(pubkey)];
        this._relays = Object.values(this._relays);
        return true;
    }
    clearRelays() {
        this._relays = [];
    }
    wisdomQuery(method, module, data = {}, bypassCache = false, options = {}) {
        return new WisdomRpcQuery(this, {
            method,
            module,
            data,
            bypassCache: bypassCache || this._bypassCache,
        }, options).run();
    }
    simpleQuery(relay, method, module, data = {}, bypassCache = false, options = {}) {
        return new SimpleRpcQuery(this, relay, {
            method,
            module,
            data,
            bypassCache: bypassCache || this._bypassCache,
        }, options).run();
    }
    clearCacheQuery(relays, method, module, data = {}, options = {}) {
        return new ClearCacheRpcQuery(this, relays, {
            method,
            module,
            data,
        }, options).run();
    }
}
