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
 * Matching is case-sensitive unless `options.cs` is set to `false`.
 *
 * @example
 * fbVal([1, 2, 3, '2'], [2]);
 * // => [1, 3]   — '2' matches too, comparison is stringified
 *
 * @example
 * // case-insensitive matching
 * fbVal(['ADMIN', 'guest'], ['admin'], { cs: false });
 * // => ['guest']
 *
 * @example
 * // nested object, depth-limited
 * fbVal({ a: { role: 'Guest' }, b: { role: 'Admin' } }, ['Guest'], { depth: 2 });
 * // => { a: {}, b: { role: 'Admin' } }
 *
 * @param {Container} ele Array or plain object to filter.
 * @param {any[] | *} input Values to remove — either an array, or a single
 *   value. A lone value is wrapped, so `fbVal(data, 'x')` and
 *   `fbVal(data, ['x'])` are equivalent, and `fbVal(data, null)` removes
 *   `null` values. Duplicates are collapsed before use. A non-array *object*
 *   is rejected, since it cannot be told apart from a container.
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
 * @throws {Error} `Case sensitivity (cs) param must be boolean` when
 *   `options.cs` is supplied and is not a boolean.
 */
function filterByValue(ele, input, options = {}) {
	/**
	 * Case sensitivity flag for the stringified comparison.
	 *
	 * Defaulted with `??` rather than `||` so that an explicit `false` survives
	 * — `false || true` is `true`, which previously made `{ cs: false }`
	 * unreachable. Nullish coalescing also lets a non-boolean such as `0` reach
	 * the guard below instead of being silently coerced to `true`.
	 *
	 * @type {boolean}
	 */
	const cs = options.cs ?? true;
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