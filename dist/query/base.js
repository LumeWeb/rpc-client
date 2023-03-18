import { clearTimeout, setTimeout } from "timers";
export default class RpcQueryBase {
    _network;
    _query;
    _options;
    _promise;
    _timeoutTimer;
    _timeout = false;
    _completed = false;
    _response;
    _error;
    _promiseResolve;
    constructor({ network, query, options = {}, }) {
        this._network = network;
        this._query = query;
        this._options = options;
    }
    get result() {
        return this._promise;
    }
    handeTimeout() {
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
                setTimeout(this.handeTimeout.bind(this), (this._options?.queryTimeout || this._network.queryTimeout) * 1000);
        this._doRun();
        return this;
    }
    async _doRun() {
        try {
            await this._network.ready;
            await this._run();
        }
        catch (e) {
            this._promiseResolve?.({ error: e?.message || e?.error });
        }
    }
    setupRelayTimeout(reject) {
        return setTimeout(() => {
            this._error = "timeout";
            reject("timeout");
        }, (this._options.relayTimeout || this._network.relayTimeout) * 1000);
    }
    async queryRpc(rpc, request) {
        let timer;
        return new Promise((resolve, reject) => {
            rpc
                // @ts-ignore
                .request(`${request.module}.${request.method}`, request.data)
                .then((resp) => {
                if (resp.error) {
                    throw new Error(resp.error);
                }
                clearTimeout(timer);
                this._response = resp;
                resolve(null);
            })
                .catch((e) => {
                this._error = e.message;
                reject({ error: e.message });
                clearTimeout(timer);
            });
            timer = this.setupRelayTimeout(reject);
        });
    }
}
