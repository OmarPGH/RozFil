/**
 * @file Regular expression repository.
 *
 * These patterns back the rigor 3 "stringified type" detection: they decide
 * whether a string should be treated as the data type it spells out rather
 * than as plain text. They are shape tests, not parsers — `'{oops'` is
 * rejected, but `'{not: valid json}'` is accepted as an object-looking string.
 */

/**
 * Matches a string that looks like a stringified JSON object, or an array of
 * them.
 *
 * Used at rigor 3 to *exclude* such strings from matching `string`, so that
 * `'{a:1}'` is filtered as an object rather than as text.
 *
 * @todo Vulnerable to polynomial ReDoS via the nested `\s*.*?\s*` quantifiers;
 *   tracked in issue #21 and replaced by `isValidJSONObjectOrArray()` in the
 *   pending fix.
 *
 * @type {RegExp}
 */
export let jsonObjArrRe = /^(\{\s*.*?\s*\}|\[\s*\{\s*.*?\s*\}\s*\])$/;

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