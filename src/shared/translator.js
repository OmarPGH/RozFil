/**
 * @file Type alias translator — the single source of truth for the alias table.
 */

import { invalid } from './invalid.js';

/** @typedef {import('../typedefs.js').TypeAlias} TypeAlias */
/** @typedef {import('../typedefs.js').CanonicalType} CanonicalType */

/**
 * Normalizes a user-supplied type name into its canonical form.
 *
 * Input is lowercased and trimmed first, so `'STR'`, `' str '` and `'string'`
 * all resolve to `'string'`. Both the shorthand and the full spelling of every
 * type are accepted, and canonical names pass through unchanged, which makes
 * the function safe to apply more than once.
 *
 * Full alias table:
 *
 * | Alias(es)                                  | Canonical                  |
 * | :----------------------------------------- | :------------------------- |
 * | `str`, `string`                            | `string`                   |
 * | `num`, `number`                            | `number`                   |
 * | `bln`, `boolean`                           | `boolean`                  |
 * | `uf`, `undefined`                          | `undefined`                |
 * | `fun`, `function`                          | `function`                 |
 * | `nl`, `null`                               | `null`                     |
 * | `arr`, `array`                             | `array`                    |
 * | `obj`, `object`                            | `object`                   |
 * | `nan`                                      | `NaN`                      |
 * | `bi`, `bigint`                             | `bigint`                   |
 * | `ifty`, `infinity`                         | `Infinity`                 |
 * | `smbl`, `symbol`                           | `symbol`                   |
 * | `tru`, `true`                              | `true`                     |
 * | `fls`, `false`                             | `false`                    |
 * | `''`, `emptystr`, `emptystring`            | `emptyString`              |
 * | `ss`, `emptystringwithspaces`              | `emptyStringWithSpaces`    |
 * | `ss?`, `emptystringorwithspaces`           | `emptyStringOrWithSpaces`  |
 * | `{s?}`, `emptyobj`, `emptyobject`          | `emptyObject`              |
 * | `[s?]`, `emptyarr`, `emptyarray`           | `emptyArray`               |
 * | `date`                                     | `date`                     |
 *
 * @example
 * translator('NAN');   // => 'NaN'
 * translator(' arr '); // => 'array'
 * translator('nope');  // => 'invalid/null'
 *
 * @param {string} [input='invalid/null'] Alias or canonical name to resolve.
 *   Typed loosely as a string rather than {@link TypeAlias}: callers reach this
 *   function with an already-stringified value, and the accepted spellings are
 *   the table above.
 * @returns {CanonicalType | 'invalid/null'} The canonical name, or the
 *   {@link module:shared/invalid~invalid} marker when nothing matches.
 * @throws {TypeError} When `input` is not a string — `null`, numbers and
 *   objects have no `toLowerCase`.
 */
function translator(input = invalid) {

	input = input.toLowerCase().trim();

	input === 'str' ? input = 'string' :
	input === 'string' ? input = 'string' :
	input === 'num' ? input = 'number' :
	input === 'number' ? input = 'number' :
	input === 'bln' ? input = 'boolean' :
	input === 'boolean' ? input = 'boolean' :
	input === 'uf' ? input = 'undefined' :
	input === 'undefined' ? input = 'undefined' :
	input === 'fun' ? input = 'function' :
	input === 'function' ? input = 'function' :
	input === 'nl' ? input = 'null' :
	input === 'null' ? input = 'null' :
	input === 'arr' ? input = 'array' :
	input === 'array' ? input = 'array' :
	input === 'obj' ? input = 'object' :
	input === 'object' ? input = 'object' :
	input === 'nan' ? input = 'NaN' :
	input === 'bi' ? input = 'bigint' :
	input === 'bigint' ? input = 'bigint' :
	input === 'ifty' ? input = 'Infinity' :
	input === 'infinity' ? input = 'Infinity' :
	input === 'smbl' ? input = 'symbol' :
	input === 'symbol' ? input = 'symbol' :
	input === 'tru' ? input = 'true' :
	input === 'true' ? input = 'true' :
	input === 'fls' ? input = 'false' :
	input === 'false' ? input = 'false' :
	input === '' ? input = 'emptyString' :
	input === 'emptystr' ? input = 'emptyString' :
	input === 'emptystring' ? input = 'emptyString' :
	input === 'ss' ? input = 'emptyStringWithSpaces' :
	input === 'emptystringwithspaces' ? input = 'emptyStringWithSpaces' :
	input === 'ss?' ? input = 'emptyStringOrWithSpaces' :
	input === 'emptystringorwithspaces' ? input = 'emptyStringOrWithSpaces' :
	input === '{s?}' ? input = 'emptyObject' :
	input === 'emptyobj' ? input = 'emptyObject' :
	input === 'emptyobject' ? input = 'emptyObject' :
	input === '[s?]' ? input = 'emptyArray' :
	input === 'emptyarr' ? input = 'emptyArray' :
	input === 'emptyarray' ? input = 'emptyArray' :
	input === 'date' ? input = 'date' :
	input = invalid;

	return input;

}

export { translator };
