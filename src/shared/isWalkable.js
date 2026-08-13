/**
 * @file Nested-container inspector.
 */

/** @typedef {import('../typedefs.js').WalkSignal} WalkSignal */

/**
 * Reports whether a value is a container the loops should recurse into.
 *
 * Both filters call this after their own matching has failed, so a nested
 * array or object is descended into rather than dropped. The return value
 * doubles as the instruction for the caller: which of the two looping helpers
 * to hand the value to.
 *
 * Note that the truthy string return is what makes `if (isWalkable(v))` work
 * as a boolean test while still carrying the container kind.
 *
 * @param {*} value Value to inspect.
 * @returns {WalkSignal | undefined} `'descendInObj'` for a plain object,
 *   `'descendInArr'` for an array, `undefined` for anything else — including
 *   `null`, which is not walkable despite `typeof null === 'object'`.
 */
function isWalkable(value) {
    const isObject = !(typeof value !== 'object' || Array.isArray(value) || value === null);
    const isArray = Array.isArray(value);
        
    if (isObject) {
        return 'descendInObj';
    }

    if (isArray) {
        return 'descendInArr';
    }
}

export { isWalkable };