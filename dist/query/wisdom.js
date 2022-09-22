import RpcQueryBase from "./base.js";
import { flatten } from "../util.js";
import { Buffer } from "buffer";
import { blake2b } from "libskynet";
import { ERR_MAX_TRIES_HIT } from "../error.js";
function flatHash(data) {
    const flattenedData = flatten(data).sort();
    return Buffer.from(blake2b(Buffer.from(JSON.stringify(flattenedData)))).toString("hex");
}
export default class WisdomRpcQuery extends RpcQueryBase {
    _maxTries = 3;
    _tries = 0;
    checkResponses() {
        const responseStore = this._responses;
        const responseStoreData = Object.values(responseStore);
        const responseObjects = responseStoreData.reduce((output, item) => {
            const hash = flatHash(item?.data);
            output[hash] = item?.data;
            return output;
        }, {});
        const responses = responseStoreData.reduce((output, item) => {
            const hash = flatHash(item?.data);
            output[hash] = output[hash] ?? 0;
            output[hash]++;
            return output;
        }, {});
        if (!Object.keys(responses).length) {
            if (Object.keys(this._errors).length) {
                this.resolve({ error: Object.values(this._errors).pop() });
                return;
            }
            if (this._tries <= this._maxTries) {
                this._tries++;
                this.retry();
                return;
            }
            this.resolve({ data: { error: ERR_MAX_TRIES_HIT } });
            return;
        }
        for (const responseHash in responses) {
            if (responses[responseHash] / responseStoreData.length >=
                this._network.majorityThreshold) {
                let response = responseObjects[responseHash];
                // @ts-ignore
                if (null === response) {
                    if (this._tries <= this._maxTries) {
                        this._tries++;
                        this.retry();
                        return;
                    }
                    response = { error: ERR_MAX_TRIES_HIT };
                }
                else {
                    response = { data: response };
                }
                this.resolve(response);
                break;
            }
        }
    }
    retry() {
        this._responses = {};
        this._errors = {};
        if (this._completed) {
            return;
        }
        this.run();
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
}
