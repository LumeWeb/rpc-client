import RpcQueryBase from "./base.js";
import { flatten } from "../util.js";
import { Buffer } from "buffer";
import { blake2b } from "libskynet";
import { ERR_MAX_TRIES_HIT } from "../error.js";
export default class WisdomRpcQuery extends RpcQueryBase {
    _maxTries = 3;
    _tries = 0;
    checkResponses() {
        const responseStore = this._responses;
        const responseStoreData = Object.values(responseStore);
        const responseObjects = responseStoreData.reduce((output, item) => {
            const itemFlattened = flatten(item?.data).sort();
            const hash = Buffer.from(blake2b(Buffer.from(JSON.stringify(itemFlattened)))).toString("hex");
            output[hash] = item?.data;
            return output;
        }, {});
        const responses = responseStoreData.reduce((output, item) => {
            const itemFlattened = flatten(item?.data).sort();
            const hash = Buffer.from(blake2b(Buffer.from(JSON.stringify(itemFlattened)))).toString("hex");
            output[hash] = output[hash] ?? 0;
            output[hash]++;
            return output;
        }, {});
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
        return this._network.relays;
    }
}
