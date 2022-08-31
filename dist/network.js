import WisdomRpcQuery from "./query/wisdom.js";
// @ts-ignore
import DHT from "@hyperswarm/dht";
import StreamingRpcQuery from "./query/streaming.js";
import SimpleRpcQuery from "./query/simple.js";
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
    streamingQuery(relay, method, module, streamHandler, data = {}, options = {}) {
        return new StreamingRpcQuery(this, relay, { method, module, data }, { ...options, streamHandler }).run();
    }
    simpleQuery(relay, method, module, data = {}, bypassCache = false, options = {}) {
        return new SimpleRpcQuery(this, relay, {
            method,
            module,
            data,
            bypassCache: bypassCache || this._bypassCache,
        }, options).run();
    }
}
