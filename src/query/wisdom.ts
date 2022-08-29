import RpcQueryBase from "./base.js";
import { flatten } from "../util.js";
import { Buffer } from "buffer";
import type { RPCResponse } from "@lumeweb/relay-types";
import { blake2b } from "libskynet";
import { ERR_MAX_TRIES_HIT } from "../error.js";

export default class WisdomRpcQuery extends RpcQueryBase {
  private _maxTries = 3;
  private _tries = 0;

  protected checkResponses(): void {
    const responseStore = this._responses;
    const responseStoreData = Object.values(responseStore);

    type ResponseGroup = { [response: string]: number };

    const responseObjects = responseStoreData.reduce((output: any, item) => {
      const itemFlattened = flatten(item?.data).sort();

      const hash = Buffer.from(
        blake2b(Buffer.from(JSON.stringify(itemFlattened)))
      ).toString("hex");
      output[hash] = item?.data;
      return output;
    }, {});
    const responses: ResponseGroup = responseStoreData.reduce(
      (output: ResponseGroup, item) => {
        const itemFlattened = flatten(item?.data).sort();
        const hash = Buffer.from(
          blake2b(Buffer.from(JSON.stringify(itemFlattened)))
        ).toString("hex");
        output[hash] = output[hash] ?? 0;
        output[hash]++;
        return output;
      },
      {}
    );

    for (const responseHash in responses) {
      if (
        responses[responseHash] / responseStoreData.length >=
        this._network.majorityThreshold
      ) {
        let response: RPCResponse = responseObjects[responseHash];

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

  private retry() {
    this._responses = {};
    this._errors = {};

    if (this._completed) {
      return;
    }

    this.run();
  }

  protected getRelays(): string[] | [] {
    return this._network.relays;
  }
}
