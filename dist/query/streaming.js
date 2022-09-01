import SimpleRpcQuery from "./simple.js";
import { Buffer } from "buffer";
import { isPromise } from "../util.js";
import { clearTimeout, setTimeout } from "timers";
import { pack, unpack } from "msgpackr";
export default class StreamingRpcQuery extends SimpleRpcQuery {
    _options;
    _canceled = false;
    constructor(network, relay, query, options) {
        super(network, relay, query, options);
        this._options = options;
    }
    cancel() {
        this._canceled = true;
    }
    async queryRelay(relay) {
        let socket;
        let relayKey = relay;
        if (relay === "string") {
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
            const finish = () => {
                relay = relay;
                this._responses[relay] = {};
                resolve(null);
                socket.end();
            };
            const listener = (res) => {
                relay = relay;
                if (timer && timer.close) {
                    clearTimeout(timer);
                }
                if (this._canceled) {
                    socket.write(pack({ cancel: true }));
                    socket.off("data", listener);
                    finish();
                    return;
                }
                const response = unpack(res);
                if (response && response.error) {
                    this._errors[relay] = response.error;
                    return reject(null);
                }
                if (response?.data.done) {
                    finish();
                    return;
                }
                this._options.streamHandler(response?.data.data);
            };
            socket.on("data", listener);
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
