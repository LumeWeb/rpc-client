function isBuffer(obj) {
    return (obj &&
        obj.constructor &&
        typeof obj.constructor.isBuffer === "function" &&
        obj.constructor.isBuffer(obj));
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
            object = Object.keys(object);
        }
        object.forEach(function (key) {
            const value = object[key];
            const isarray = opts.safe && Array.isArray(value);
            const type = Object.prototype.toString.call(value);
            const isbuffer = isBuffer(value);
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
