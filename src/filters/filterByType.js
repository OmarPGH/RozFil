/**
 * @file Type-exclusion filter. Public entry point behind the `fbType` export.
 */

import { filterEngineRouter, isWalkable, isValidJSONObjectOrArray, reBook } from '../shared/index.js';

/** @typedef {import('../typedefs.js').Container} Container */
/** @typedef {import('../typedefs.js').TypeAlias} TypeAlias */
/** @typedef {import('../typedefs.js').CanonicalType} CanonicalType */
/** @typedef {import('../typedefs.js').FbTypeOptions} FbTypeOptions */
/** @typedef {import('../typedefs.js').FilterVerdict} FilterVerdict */

/**
 * Removes every item whose type matches one of the given type names.
 *
 * RozFil works on an exclusion model: the listed types are what gets deleted,
 * everything else survives. Nested arrays and objects are always walked into
 * (up to `options.depth`) rather than being matched as a whole, unless the
 * requested type is itself `array` or `object`.
 *
 * @example
 * // strip native numbers and stringified numbers
 * fbType([10, 'hello', '123', null], ['num'], { rigor: 3 });
 * // => ['hello', null]
 *
 * @example
 * // rigor 2 separates NaN from number
 * fbType([1, NaN, 2], ['nan'], { rigor: 2 });
 * // => [1, 2]
 *
 * @param {Container} ele Array or plain object to filter.
 * @param {TypeAlias[]} input Type names to exclude, shorthand or canonical.
 *   Duplicates are collapsed before use.
 * @param {FbTypeOptions} [options={}] Traversal and precision settings.
 * @returns {Container} The filtered container — a `structuredClone` of `ele`
 *   by default, or `ele` itself when `options.inPlace` is `true`.
 * @throws {Error} `Rigor must be 1/2/3` when `options.rigor` is outside 1-3.
 * @throws {Error} `Unsupported type` when `ele` is neither array nor plain object.
 * @throws {Error} `Type Error, only those allowed at the selected rigor` when a
 *   name in `input` is unknown, or is not selectable at the chosen rigor —
 *   e.g. `'nan'` at rigor 1.
 * @throws {Error} `Types is more than N` when `input` holds more distinct names
 *   than the chosen rigor allows.
 * @throws {Error} `Array length is less than 1` / `Object items is less than 1`
 *   when `ele` is empty.
 * @throws {Error} `unable to clone your ...` when `inPlace` is `false` and `ele`
 *   holds non-cloneable members such as symbols or functions.
 * @throws {Error} `In place (inPlace) option must be boolean` /
 *   `depth option must be integer or infinity` on malformed options.
 * @throws {TypeError} When `input` is a bare string rather than an array. Pass
 *   `['num']`, not `'num'`.
 *
 * @see {@link module:shared/translator~translator} for the full alias table.
 */
function filterByType(ele, input, options = {}) {

	const rigor = options.rigor ?? 1;
	if (rigor < 1 || rigor > 3) throw new Error("Rigor must be 1/2/3")
	
	/**
	 * Canonical type names selectable at the active rigor level. Anything in
	 * `input` that does not translate into this list is rejected.
	 *
	 * @type {CanonicalType[] | undefined}
	 */
	let allowed;
	
	if (rigor === 1) {
		allowed = ['string', 'number', 'boolean', 'function', 'object', 'bigint', 'symbol'];
	} else if (rigor === 2 || rigor === 3) {
		allowed = ['string', 'number', 'boolean', 'undefined', 'function', 'null', 'array', 'object', 'NaN', 'bigint', 'Infinity', 'symbol', 'true', 'false', 'emptyString', 'emptyStringWithSpaces', 'emptyStringOrWithSpaces', 'emptyObject', 'emptyArray', 'date'];
	}

	/**
	 * Decides the fate of a single value for one requested type.
	 *
	 * Called once per value per entry in `input`. A container that did not
	 * match the requested type is reported as walkable so the looping helpers
	 * recurse into it instead of discarding it.
	 *
	 * @param {string | undefined} key Property name when walking an object,
	 *   `undefined` when walking an array. Unused — matching is value-based.
	 * @param {*} value The value under inspection.
	 * @param {CanonicalType} currentInput The single type being tested on this pass.
	 * @returns {FilterVerdict} `true` to delete, `false` to keep, or a walk
	 *   signal to keep and descend.
	 */
	function filterFun(key, value, currentInput){

		const valueType = typeof value;
		/**
		 * `value` with surrounding whitespace removed, for the stringified
		 * comparisons at rigor 3. Stays `undefined` for non-strings.
		 *
		 * @type {string | undefined}
		 */
		let valueTrim;

		valueType === 'string' ? valueTrim = value.trim() : 'Not String';

		/**
		 * Rigor 1 match: a plain `typeof` equality check.
		 *
		 * @returns {true | undefined} `true` on a match, otherwise `undefined`.
		 */
		function rigorOne() {
			if (currentInput === typeof value) {
				return true;
			}
		}

		/**
		 * Rigor 2 match: strict native type differentiation.
		 *
		 * Unlike `typeof`, this pulls `null`, `NaN`, `Infinity` and `array`
		 * out of their broad buckets so each can be excluded on its own.
		 * `date` matches strings that `Date.parse` accepts.
		 *
		 * @returns {true | undefined} `true` on a match, otherwise `undefined`.
		 */
		function rigorTwo() {
			
			if (currentInput === 'string' && valueType === 'string') {
				return true;
			} 

			if (currentInput === 'number' && valueType === 'number' && !Number.isNaN(value) && value !== Infinity) {
				return true;
			} 

			if (currentInput === 'boolean' && valueType === 'boolean') {
				return true;
			} 

			if (currentInput === 'undefined' && valueType === 'undefined') {
				return true;
			} 

			if (currentInput === 'function' && valueType === 'function') {
				return true;
			} 

			if (currentInput === 'null' && value === null) {
				return true;
			} 

			if (currentInput === 'array' && Array.isArray(value)) {
				return true;
			} 

			if (currentInput === 'object' && valueType === 'object' && value !== null && !Array.isArray(value)) {
				return true;
			}

			if (currentInput === 'NaN' && Number.isNaN(value)) {
				return true;
			}

			if (currentInput === 'bigint' && valueType === 'bigint') {
				return true;
			}

			if (currentInput === 'Infinity' && value === Infinity) {
				return true;
			}

			if (currentInput === 'symbol' && valueType === 'symbol') {
				return true;
			}

			if (currentInput === 'true' && value === true) {
				return true;
			}

			if (currentInput === 'false' && value === false) {
				return true;
			}

			if (currentInput === 'date' && valueType === 'string' && !Number.isNaN(Date.parse(value))) {
				return true;
			}

		}

		/**
		 * Rigor 3 match: everything rigor 2 detects, plus text-wrapped data.
		 *
		 * A string is also treated as the type it spells out, so `'123'`
		 * matches `number`, `'true'` matches `boolean`, `'[1,2]'` matches
		 * `array` and `'{a:1}'` matches `object`. Conversely `string` stops
		 * matching strings that parse as JSON objects or arrays. The `empty*`
		 * aliases are only meaningful at this level.
		 *
		 * Note the asymmetry: `array` and `object` use the loose shape tests
		 * in {@link module:shared/regexBook}, while the `string` exclusion
		 * uses strict JSON parsing. A brace-wrapped string that is not valid
		 * JSON, such as `'{a:1}'`, therefore matches both `object` and
		 * `string`.
		 *
		 * @returns {true | undefined} `true` on a match, otherwise `undefined`.
		 */
		function rigorThree() {
			
			if (currentInput === 'string' && valueType === 'string' && !isValidJSONObjectOrArray(value)) {
				return true;
			} 
			
			if (currentInput === 'number' && (valueType === 'number' && !Number.isNaN(value) && value !== Infinity || reBook.numberRe.test(valueTrim))) {
				return true;
			} 

			if (currentInput === 'boolean' && (valueType === 'boolean' || valueTrim === 'true' || valueTrim === 'false')) {
				return true;
			} 

			if (currentInput === 'undefined' && (valueType === 'undefined' || valueTrim === 'undefined')) {
				return true;
			} 

			if (currentInput === 'function' && valueType === 'function') {
				return true;
			} 

			if (currentInput === 'null' && (value === null || valueTrim === 'null')) {
				return true;
			} 

			if (currentInput === 'array' && (Array.isArray(value) || reBook.arrRe.test(valueTrim))) {
				return true;
			} 

			if (currentInput === 'object' && (valueType === 'object' && value !== null && !Array.isArray(value) || reBook.objectRe.test(valueTrim))) {
				return true;
			}

			if (currentInput === 'NaN' && (Number.isNaN(value) || valueTrim === 'NaN')) {
				return true;
			}

			if (currentInput === 'bigint' && (valueType === 'bigint' || reBook.bigintRe.test(valueTrim))) {
				return true;
			}

			if (currentInput === 'Infinity' && (value === Infinity || valueTrim === 'Infinity')) {
				return true;
			}

			if (currentInput === 'symbol' && valueType === 'symbol') {
				return true;
			}

			if (currentInput === 'true' && (value === true || valueTrim === 'true')) {
				return true;
			}

			if (currentInput === 'false' && (value === false || valueTrim === 'false')) {
				return true;
			}

			if (currentInput === 'emptyString' && value === '') {
				return true;
			}

			if (currentInput === 'emptyStringWithSpaces' && valueType === 'string' && reBook.emptyStringWithSpacesRe.test(value)) {
				return true;
			}

			if (currentInput === 'emptyStringOrWithSpaces' && valueTrim === '') {
				return true;
			}

			if (currentInput === 'emptyArray' && Array.isArray(value) && value.length === 0) {
				return true;
			}

			if (currentInput === 'emptyObject' && valueType === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0) {
				return true;
			}

			if (currentInput === 'date' && valueType === 'string' && !Number.isNaN(Date.parse(value))) {
				return true;
			}

		}

		if (rigor === 1) {
			if (rigorOne()) return true;
		} else if (rigor === 2) {
			if (rigorTwo()) return true;
		} else if (rigor === 3) {
			if (rigorThree()) return true;
		}

		let isWalkableRes = isWalkable(value);
		if (isWalkableRes) return isWalkableRes;

		return false;

	}
	
	return filterEngineRouter(ele, input, options, filterFun, allowed);
}

export { filterByType };