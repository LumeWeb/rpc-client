import { clearTimeout, setTimeout } from "timers";
import { pack, unpack } from "msgpackr";
import { Buffer } from "buffer";
import { isPromise } from "../util.js";
export default class RpcQueryBase {
    _network;
    _query;
    _options;
    _promise;
    _timeoutTimer;
    _timeout = false;
    _timeoutCanceled = false;
    _completed = false;
    _responses = {};
    _errors = {};
    _promiseResolve;
    constructor(network, query, options = {}) {
        this._network = network;
        this._query = query;
        this._options = options;
    }
    get result() {
        return this._promise;
    }
    handeTimeout() {
        if (this._timeoutCanceled) {
            return;
        }
        this.resolve(undefined, true);
    }
    resolve(data, timeout = false) {
        clearTimeout(this._timeoutTimer);
        this._timeout = timeout;
        this._completed = true;
        if (timeout) {
            data = {
                error: "timeout",
            };
        }
        this._promiseResolve?.(data);
    }
    run() {
        this._promise =
            this._promise ??
                new Promise((resolve) => {
                    this._promiseResolve = resolve;
                });
        this._timeoutTimer =
            this._timeoutTimer ??
                setTimeout(this.handeTimeout.bind(this), (this._options.queryTimeout || this._network.queryTimeout) * 1000);
        this._network.ready.then(() => {
            const promises = [];
            for (const relay of this.getRelays()) {
                promises.push(this.queryRelay(relay));
            }
            Promise.allSettled(promises).then(() => this.checkResponses());
        });
        return this;
    }
    async queryRelay(relay) {
        let socket;
        let relayKey = relay;
        if (typeof relay === "string") {
            relayKey = Buffer.from(relay, "hex");
        }
        if (relay instanceof Buffer) {
            relayKey = relay;
            relay = relay.toString("hex");
        }
        try {
            socket = this._network.dht.connect(relayKey);
            if (isPromise(socket)) {
                socket = await socket;
            }
        }
        catch (e) {
            return;
        }
        return new Promise((resolve, reject) => {
            let timer;
            socket.on("data", (res) => {
                relay = relay;
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                socket.end();
                const response = unpack(res);
                if (response && response.error) {
                    this._errors[relay] = response.error;
                    return reject(null);
                }
                this._responses[relay] = response;
                resolve(null);
            });
            socket.on("error", (error) => {
                relay = relay;
                this._errors[relay] = error;
                reject({ error });
            });
            socket.write("rpc");
            socket.write(pack(this._query));
            timer = setTimeout(() => {
                this._errors[relay] = "timeout";
                reject(null);
            }, (this._options.relayTimeout || this._network.relayTimeout) * 1000);
        });
    }
}
