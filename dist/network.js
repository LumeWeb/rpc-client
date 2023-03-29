// @ts-ignore
import Hyperswarm from "hyperswarm";
import RpcNetworkQueryFactory from "./query/index.js";
import b4a from "b4a";
import { createHash, maybeGetAsyncProperty } from "./util.js";
export default class RpcNetwork {
    _relaysAvailablePromise;
    _relaysAvailableResolve;
    constructor(swarm = new Hyperswarm()) {
        this._swarm = swarm;
        this.init();
    }
    _methods = new Map();
    get methods() {
        return this._methods;
    }
    _factory = new RpcNetworkQueryFactory(this);
    get factory() {
        return this._factory;
    }
    _swarm;
    get swarm() {
        return this._swarm;
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
    _relays = new Map();
    get relays() {
        return this._relays;
    }
    _ready;
    get ready() {
        if (!this._ready) {
            this._ready = maybeGetAsyncProperty(this._swarm.dht).then((dht) => dht.ready());
        }
        return this._ready;
    }
    get readyWithRelays() {
        return this.ready.then(() => this._relaysAvailablePromise);
    }
    _bypassCache = false;
    get bypassCache() {
        return this._bypassCache;
    }
    set bypassCache(value) {
        this._bypassCache = value;
    }
    getAvailableRelay(module, method) {
        method = `${module}.${method}`;
        let relays = this._methods.get(method) ?? new Set();
        if (!relays.size) {
            throw Error("no available relay");
        }
        return this._relays.get(Array.from(relays)[Math.floor(Math.random() * relays.size)]);
    }
    getRelay(pubkey) {
        if (this._relays.has(pubkey)) {
            return this._relays.get(pubkey);
        }
        return undefined;
    }
    init() {
        this._swarm.join(createHash("lumeweb"));
        this.setupRelayPromise();
        this._swarm.on("connection", async (relay) => {
            const pubkey = b4a
                .from(await maybeGetAsyncProperty(relay.remotePublicKey))
                .toString("hex");
            relay.once("close", () => {
                this._methods.forEach((item) => {
                    if (item.has(pubkey)) {
                        item.delete(pubkey);
                    }
                });
                this.relays.delete(pubkey);
                if (!this._relays.size) {
                    this.setupRelayPromise();
                }
            });
            const query = this._factory.simple({
                relay,
                query: { module: "core", method: "get_methods", data: null },
            });
            const resp = await query.result;
            if (resp.error) {
                relay.end();
                return;
            }
            if (resp.data) {
                this._relays.set(pubkey, relay);
                resp.data.forEach((item) => {
                    const methods = this._methods.get(item) ?? new Set();
                    methods.add(pubkey);
                    this._methods.set(item, methods);
                });
                this._relaysAvailableResolve?.();
            }
        });
    }
    setupRelayPromise() {
        this._relaysAvailablePromise = new Promise((resolve) => {
            this._relaysAvailableResolve = resolve;
        });
    }
}
