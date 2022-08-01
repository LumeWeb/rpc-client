import { clearTimeout, setTimeout } from "timers";
import { pack, unpack } from "msgpackr";
import { Buffer } from "buffer";
import { blake2b } from "libskynet";
import jsonStringify from "json-stable-stringify";
export default class RpcQuery {
    _network;
    _query;
    _promise;
    _timeoutTimer;
    _timeout = false;
    _completed = false;
    _responses = {};
    _promiseResolve;
    constructor(network, query) {
        this._network = network;
        this._query = query;
        this.init();
    }
    get result() {
        return this._promise;
    }
    handeTimeout() {
        this.resolve(false, true);
    }
    resolve(data, timeout = false) {
        clearTimeout(this._timeoutTimer);
        this._timeout = timeout;
        this._completed = true;
        // @ts-ignore
        this._promiseResolve(data);
    }
    async init() {
        this._promise =
            this._promise ??
                new Promise((resolve) => {
                    this._promiseResolve = resolve;
                });
        this._timeoutTimer =
            this._timeoutTimer ??
                setTimeout(this.handeTimeout.bind(this), this._network.queryTimeout * 1000);
        await this._network.ready;
        const promises = [];
        // tslint:disable-next-line:forin
        for (const relay of this._network.relays) {
            promises.push(this.queryRelay(relay));
        }
        await Promise.allSettled(promises);
        this.checkResponses();
    }
    async queryRelay(relay) {
        let socket;
        try {
            socket = this._network.dht.connect(Buffer.from(relay, "hex"));
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
                clearTimeout(timer);
                socket.end();
                const response = unpack(res);
                if (response && response.error) {
                    return reject(response);
                }
                this._responses[relay] = response;
                resolve(null);
            });
            socket.on("error", (error) => reject({ error }));
            socket.write("rpc");
            socket.write(pack(this._query));
            timer = setTimeout(() => {
                reject("timeout");
            }, this._network.relayTimeout * 1000);
        });
    }
    checkResponses() {
        const responseStore = this._responses;
        const responseStoreData = Object.values(responseStore);
        const responseObjects = responseStoreData.reduce((output, item) => {
            const hash = Buffer.from(blake2b(Buffer.from(jsonStringify(item?.data)))).toString("hex");
            output[hash] = item?.data;
            return output;
        }, {});
        const responses = responseStoreData.reduce((output, item) => {
            const hash = Buffer.from(blake2b(Buffer.from(jsonStringify(item?.data)))).toString("hex");
            output[hash] = output[hash] ?? 0;
            output[hash]++;
            return output;
        }, {});
        for (const responseHash in responses) {
            if (responses[responseHash] / responseStoreData.length >=
                this._network.majorityThreshold) {
                // @ts-ignore
                const response = responseObjects[responseHash];
                // @ts-ignore
                if (null === response) {
                    this.retry();
                    return;
                }
                this.resolve(response);
                break;
            }
        }
    }
    retry() {
        this._responses = {};
        if (this._completed) {
            return;
        }
        this.init();
    }
}
function isPromise(obj) {
    return (!!obj &&
        (typeof obj === "object" || typeof obj === "function") &&
        typeof obj.then === "function");
}
