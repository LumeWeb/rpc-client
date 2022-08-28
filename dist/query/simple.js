import RpcQueryBase from "./base.js";
export default class SimpleRpcQuery extends RpcQueryBase {
    _relay;
    constructor(network, relay, query, options) {
        super(network, query, options);
        this._relay = relay;
    }
    checkResponses() {
        if (Object.keys(this._responses).length) {
            this.resolve(Object.values(this._responses).pop());
            return;
        }
        if (Object.keys(this._errors).length) {
            this.resolve({ error: Object.values(this._errors).pop() });
            return;
        }
    }
    getRelays() {
        return [this._relay];
    }
}
