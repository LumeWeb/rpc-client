import { clearTimeout } from "timers";
import b4a from "b4a";
import { flatten, isPromise, validateResponse, validateTimestampedResponse, } from "../util.js";
import RPC from "@lumeweb/rpc";
import { blake2b } from "libskynet";
import { ERR_INVALID_SIGNATURE, ERR_NO_RELAYS } from "../error.js";
import RpcQueryBase from "./base.js";
function flatHash(data) {
    const flattenedData = flatten(data).sort();
    return Buffer.from(blake2b(Buffer.from(JSON.stringify(flattenedData)))).toString("hex");
}
export default class WisdomRpcQuery extends RpcQueryBase {
    static _activeRelay;
    static get activeRelay() {
        return this._activeRelay;
    }
    get result() {
        return this._promise;
    }
    async _run() {
        await this.setupRelay();
        await this.queryRelay();
        await this.checkResponse();
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
    async queryRelay() {
        let activeRelay = WisdomRpcQuery.activeRelay;
        let relays = this.getRelays();
        if (!relays.length) {
            throw new Error(ERR_NO_RELAYS);
        }
        return this.queryRpc(activeRelay, {
            module: "rpc",
            method: "broadcast_request",
            data: {
                request: this._query,
                relays,
            },
        });
    }
    async checkResponse() {
        if (this._error) {
            this.resolve({ error: this._error });
            return;
        }
        if (!validateResponse(WisdomRpcQuery.activeRelay.stream.remotePublicKey, this._response)) {
            this.resolve({ error: ERR_INVALID_SIGNATURE });
            return;
        }
        let relays = [];
        for (const relay in this._response?.relays) {
            const resp = this._response?.relays[relay];
            if (validateTimestampedResponse(b4a.from(relay, "hex"), resp)) {
                relays.push(resp);
            }
        }
        if (!relays.length) {
            this.resolve({ error: ERR_NO_RELAYS });
            return;
        }
        const responseObjects = relays.reduce((output, item) => {
            const field = item.signedField || "data";
            // @ts-ignore
            const hash = flatHash(item[field]);
            output[hash] = item?.data;
            return output;
        }, {});
        const responses = relays.reduce((output, item) => {
            const field = item.signedField || "data";
            // @ts-ignore
            const hash = flatHash(item[field]);
            output[hash] = output[hash] ?? 0;
            output[hash]++;
            return output;
        }, {});
        for (const responseHash in responses) {
            if (responses[responseHash] / relays.length >=
                this._network.majorityThreshold) {
                let response = responseObjects[responseHash];
                response = { data: response };
                this.resolve(response);
                break;
            }
        }
    }
    getRelays() {
        if (this._network.maxRelays === 0 ||
            this._network.relays.length <= this._network.maxRelays) {
            return this._network.relays;
        }
        const list = [];
        let available = this._network.relays;
        while (list.length <= this._network.maxRelays) {
            const item = Math.floor(Math.random() * available.length);
            list.push(available[item]);
            available.splice(item, 1);
        }
        return list;
    }
    async setupRelay() {
        let active = WisdomRpcQuery.activeRelay;
        let relays = this._network.relays;
        if (!active) {
            if (!relays.length) {
                throw new Error(ERR_NO_RELAYS);
            }
            let relay = relays[Math.floor(Math.random() * relays.length)];
            let socket = this._network.dht.connect(b4a.from(relay, "hex"));
            if (isPromise(socket)) {
                socket = await socket;
            }
            await socket.opened;
            WisdomRpcQuery._activeRelay = new RPC(socket);
            socket.once("close", () => {
                WisdomRpcQuery._activeRelay = undefined;
            });
        }
    }
}
