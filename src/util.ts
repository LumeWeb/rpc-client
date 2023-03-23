// @ts-ignore
import stringify from "json-stringify-deterministic";
import type { RPCRequest, RPCResponse } from "@lumeweb/interface-relay";
// @ts-ignore
import crypto from "hypercore-crypto";
// @ts-ignore
import sodium from "sodium-universal";
import b4a from "b4a";
import RPC from "@lumeweb/rpc";
export const RPC_PROTOCOL_SYMBOL = Symbol.for("lumeweb");

export function isPromise(obj: Promise<any>) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

/*
Forked from https://github.com/hughsk/flat
 */
export function flatten(target: any, opts: any = {}): any[] {
  opts = opts || {};

  const delimiter = opts.delimiter || ".";
  const maxDepth = opts.maxDepth;
  const transformKey =
    opts.transformKey || ((key: any) => (isNaN(parseInt(key)) ? key : ""));
  const output: any[] = [];

  function step(object: any, prev?: any, currentDepth?: any) {
    currentDepth = currentDepth || 1;
    if (!Array.isArray(object)) {
      object = Object.keys(object ?? {});
    }
    object.forEach(function (key: any) {
      const value = object[key];
      const isarray = opts.safe && Array.isArray(value);
      const type = Object.prototype.toString.call(value);
      const isbuffer = b4a.isBuffer(value);
      const isobject = type === "[object Object]" || type === "[object Array]";

      const newKey = prev
        ? prev + delimiter + transformKey(key)
        : transformKey(key);

      if (
        !isarray &&
        !isbuffer &&
        isobject &&
        Object.keys(value).length &&
        (!opts.maxDepth || currentDepth < maxDepth)
      ) {
        return step(value, newKey, currentDepth + 1);
      }

      output.push(`${newKey}=${value}`);
    });
  }

  step(target);

  return output;
}

export function validateResponse(
  relay: Buffer,
  response: RPCResponse,
  timestamped = false
): boolean {
  const field = response.signedField || "data";
  // @ts-ignore
  let json = response[field];
  if (typeof json !== "string") {
    json = stringify(json);
  }
  const updated = response.updated as number;

  if (timestamped && updated) {
    json = updated.toString() + json;
  }

  return !!crypto.verify(
    b4a.from(json),
    b4a.from(response.signature as string, "hex"),
    relay
  );
}

export function validateTimestampedResponse(
  relay: Buffer,
  response: RPCResponse
): boolean {
  return validateResponse(relay, response, true);
}

export function hashQuery(query: RPCRequest): string {
  const clonedQuery: RPCRequest = {
    module: query.module,
    method: query.method,
    data: query.data,
  };
  const queryHash = Buffer.allocUnsafe(32);
  sodium.crypto_generichash(queryHash, Buffer.from(stringify(clonedQuery)));

  return queryHash.toString("hex");
}

export function createHash(data: string): Buffer {
  const buffer = b4a.from(data);
  let hash = b4a.allocUnsafe(32) as Buffer;
  sodium.crypto_generichash(hash, buffer);

  return hash;
}

export function setupStream(stream: any) {
  const existing = stream[RPC_PROTOCOL_SYMBOL];
  if (existing) {
    return existing;
  }

  stream[RPC_PROTOCOL_SYMBOL] = new RPC(stream);

  return stream[RPC_PROTOCOL_SYMBOL];
}
