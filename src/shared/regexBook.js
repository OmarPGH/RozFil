/**
 * @file Regular expression repository.
 *
 * These patterns back the rigor 3 "stringified type" detection: they decide
 * whether a string should be treated as the data type it spells out rather
 * than as plain text. They are shape tests, not parsers, which is why they
 * suit scalars — a numeric string either looks like a number or it does not,
 * with no structure to get wrong.
 *
 * Container detection deliberately no longer lives here. `arrRe` and
 * `objectRe` were removed in #33 once `array`, `object` and `string` were all
 * routed through {@link module:shared/jsonValidator~jsonKindOf}: being shape
 * tests, they accepted text such as `'{a:1}'` that does not parse, which let a
 * single value match two aliases at once. `jsonObjArrRe` went earlier, in #21,
 * for being vulnerable to polynomial ReDoS.
 *
 * Every remaining pattern is anchored and free of nested quantifiers, so each
 * runs in linear time.
 */

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