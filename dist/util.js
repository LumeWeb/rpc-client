// @ts-ignore
import stringify from "json-stringify-deterministic";
// @ts-ignore
import crypto from "hypercore-crypto";
import b4a from "b4a";
export function isPromise(obj) {
    return (!!obj &&
        (typeof obj === "object" || typeof obj === "function") &&
        typeof obj.then === "function");
}
/*
Forked from https://github.com/hughsk/flat
 */
export function flatten(target, opts = {}) {
    opts = opts || {};
    const delimiter = opts.delimiter || ".";
    const maxDepth = opts.maxDepth;
    const transformKey = opts.transformKey || ((key) => (isNaN(parseInt(key)) ? key : ""));
    const output = [];
    function step(object, prev, currentDepth) {
        currentDepth = currentDepth || 1;
        if (!Array.isArray(object)) {
            object = Object.keys(object ?? {});
        }
        object.forEach(function (key) {
            const value = object[key];
            const isarray = opts.safe && Array.isArray(value);
            const type = Object.prototype.toString.call(value);
            const isbuffer = b4a.isBuffer(value);
            const isobject = type === "[object Object]" || type === "[object Array]";
            const newKey = prev
                ? prev + delimiter + transformKey(key)
                : transformKey(key);
            if (!isarray &&
                !isbuffer &&
                isobject &&
                Object.keys(value).length &&
                (!opts.maxDepth || currentDepth < maxDepth)) {
                return step(value, newKey, currentDepth + 1);
            }
            output.push(`${newKey}=${value}`);
        });
    }
    step(target);
    return output;
}
export function validateResponse(relay, response, timestamped = false) {
    const field = response.signedField || "data";
    // @ts-ignore
    const data = response[field];
    let json = data;
    if (typeof json !== "string") {
        json = stringify(json);
    }
    const updated = response.updated;
    if (timestamped && updated) {
        json = updated.toString() + json;
    }
    return !!crypto.verify(b4a.from(json), b4a.from(response.signature, "hex"), relay);
}
export function validateTimestampedResponse(relay, response) {
    return validateResponse(relay, response, true);
}
