import { clearTimeout, setTimeout } from "timers";
import { pack, unpack } from "msgpackr";
export default class RpcQuery {
    constructor(network, query) {
        this._timeout = false;
        this._completed = false;
        this._responses = {};
        this._network = network;
        this._query = query;
        this.init();
    }
    get promise() {
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
        const socket = this._network.dht.connect(Buffer.from(relay, "hex"));
        return new Promise((resolve, reject) => {
            socket.on("data", (res) => {
                socket.end();
                const response = unpack(res);
                if (response && response.error) {
                    return reject(response);
                }
                this._responses[relay] = response;
                resolve(null);
            });
            socket.on("error", (error) => reject({ error }));
            socket.write(pack(this._query));
        });
    }
    checkResponses() {
        const responses = {};
        const responseStore = this._responses;
        const responseStoreKeys = Object.keys(responseStore);
        // tslint:disable-next-line:forin
        for (const peer in responseStore) {
            const responseIndex = responseStoreKeys.indexOf(peer);
            responses[responseIndex] = responses[responseIndex] ?? 0;
            responses[responseIndex]++;
        }
        for (const responseIndex in responses) {
            if (responses[responseIndex] / responseStoreKeys.length >= this._network.majorityThreshold) {
                const response = responseStore[responseStoreKeys[parseInt(responseIndex, 10)]];
                // @ts-ignore
                if (null === response || null === response?.data) {
                    this.retry();
                    return;
                }
                this.resolve(response?.data);
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
