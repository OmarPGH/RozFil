/**
 * @file Value-exclusion filter. Public entry point behind the `fbVal` export.
 */

import { filterEngineRouter, isWalkable } from '../shared/index.js';

/** @typedef {import('../typedefs.js').Container} Container */
/** @typedef {import('../typedefs.js').FbValOptions} FbValOptions */
/** @typedef {import('../typedefs.js').FilterVerdict} FilterVerdict */

/**
 * Removes every item equal to one of the given values.
 *
 * Comparison is stringified: both sides are passed through `String()` before
 * being compared, so `1` and `'1'` are treated as the same value. Nested
 * arrays and objects are walked into up to `options.depth`; containers
 * themselves are never removed, only the leaf values inside them.
 *
 * @example
 * fbVal([1, 2, 3, '2'], [2]);
 * // => [1, 3]   — '2' matches too, comparison is stringified
 *
 * @example
 * // nested object, depth-limited
 * fbVal({ a: { role: 'Guest' }, b: { role: 'Admin' } }, ['Guest'], { depth: 2 });
 * // => { a: {}, b: { role: 'Admin' } }
 *
 * @param {Container} ele Array or plain object to filter.
 * @param {any[]} input Values to remove. Duplicates are collapsed before use.
 * @param {FbValOptions} [options={}] Traversal and comparison settings.
 * @returns {Container} The filtered container — a `structuredClone` of `ele`
 *   by default, or `ele` itself when `options.inPlace` is `true`.
 * @throws {Error} `Unsupported type` when `ele` is neither array nor plain object.
 * @throws {Error} `Array length is less than 1` / `Object items is less than 1`
 *   when `ele` is empty.
 * @throws {Error} `unable to clone your ...` when `inPlace` is `false` and `ele`
 *   holds non-cloneable members such as symbols or functions.
 * @throws {Error} `In place (inPlace) option must be boolean` /
 *   `depth option must be integer or infinity` on malformed options.
 * @throws {ReferenceError} When `ele` is an object and `input` is not an array.
 *   Wrap single values in an array: `['x']`, not `'x'`.
 */
function filterByValue(ele, input, options = {}) {
	/**
	 * Case sensitivity flag for the stringified comparison.
	 *
	 * Note: because the default is applied with `||`, a passed `false` falls
	 * through to `true` — comparison is currently always case-sensitive and
	 * `{ cs: false }` has no effect, despite the README documenting a `false`
	 * default. Documented here as the code behaves today.
	 *
	 * @type {boolean}
	 */
	const cs = options.cs || true;
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) param must be boolean');
	/**
	 * `fbVal` matches raw values rather than a fixed vocabulary, so there is
	 * no allow-list to validate `input` against. Passing `undefined` tells the
	 * engines to skip alias translation entirely.
	 *
	 * @type {undefined}
	 */
	const allowed = undefined;
	/**
	 * Decides the fate of a single value against one target value.
	 *
	 * @param {string | undefined} key Property name when walking an object,
	 *   `undefined` when walking an array. Unused — matching is value-based.
	 * @param {*} value The value under inspection.
	 * @param {*} currentInput The single target value being tested on this pass.
	 * @returns {FilterVerdict} `true` to delete, `false` to keep, or a walk
	 *   signal to keep and descend.
	 */
	function filterFun(key, value, currentInput){

		let isWalkableRes = isWalkable(value);
		if (isWalkableRes) return isWalkableRes;

		value = String(value);
		currentInput = String(currentInput);
		
		if (cs === false) {

			if (currentInput.toLowerCase() === value.toLowerCase()) return true;

		} else if (cs === true) {

			if (currentInput === value) return true;

		}

		return false;

	}

	return filterEngineRouter(ele, input, options, filterFun, allowed);
}

export { filterByValue }