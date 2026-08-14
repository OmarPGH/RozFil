/**
 * @file Regular expression repository.
 *
 * These patterns back the rigor 3 "stringified type" detection: they decide
 * whether a string should be treated as the data type it spells out rather
 * than as plain text. They are shape tests, not parsers — `'{oops'` is
 * rejected, but `'{not: valid json}'` is accepted as an object-looking string.
 *
 * Every pattern here is anchored and free of nested quantifiers, so each runs
 * in linear time. The one exception, `jsonObjArrRe`, was removed in favour of
 * {@link module:shared/jsonValidator~isValidJSONObjectOrArray} after it was
 * found vulnerable to polynomial ReDoS — see issue #21.
 */

/**
 * Matches a string wrapped in square brackets, e.g. `'[1, 2]'`.
 *
 * Tested against the trimmed value, so leading and trailing whitespace is
 * tolerated by the caller rather than by the pattern.
 *
 * @type {RegExp}
 */
export let arrRe = /^\[.*\]$/;

/**
 * Matches a string wrapped in curly braces, e.g. `'{a: 1}'`.
 *
 * @type {RegExp}
 */
export let objectRe = /^\{.*\}$/;

/**
 * Matches a decimal integer or float, optionally signed, e.g. `'-12.5'`.
 *
 * Deliberately narrower than `Number()`: exponent notation, hex literals and
 * `Infinity` are not accepted, so `'1e3'` stays a string at rigor 3.
 *
 * @type {RegExp}
 */
export let numberRe = /^-?\d+(\.\d+)?$/;

/**
 * Matches a BigInt literal written as text, e.g. `'9007199254740993n'`.
 *
 * @type {RegExp}
 */
export let bigintRe = /^-?\d+n$/;

/**
 * Matches a string made entirely of whitespace, e.g. `'   '`.
 *
 * Requires at least one character, so the empty string does not match — that
 * is what separates the `emptyStringWithSpaces` alias from `emptyString`.
 *
 * @type {RegExp}
 */
export let emptyStringWithSpacesRe = /^\s+$/;