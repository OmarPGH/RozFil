/**
 * @file Safe stringified-JSON detection.
 *
 * Replaces the `jsonObjArrRe` pattern that used to live in
 * {@link module:shared/regexBook}, which was vulnerable to polynomial ReDoS:
 * its nested `\s*.*?\s*` quantifiers forced the engine to try every possible
 * split of the input, so an unterminated `'{'` followed by whitespace scaled
 * cubically — roughly two minutes for 8,000 characters, and hours at the
 * 50,000 the report used.
 *
 * `JSON.parse` is a linear-time native parser, so the same input is rejected
 * in microseconds regardless of length, and the answer is exact rather than
 * shape-approximate.
 */

/**
 * Reports whether a string parses as a JSON object or array.
 *
 * Deliberately stricter than a shape test: the string must be well-formed
 * JSON, not merely brace-wrapped. `'{a:1}'` is rejected because JSON requires
 * quoted keys, while `'{"a":1}'` is accepted.
 *
 * Primitives are rejected even though `JSON.parse` accepts them — `'123'`,
 * `'true'`, `'null'` and `'"text"'` all parse without throwing, so the parsed
 * result is type-checked rather than the parse merely being attempted. `null`
 * needs its own check because `typeof null === 'object'`.
 *
 * @example
 * isValidJSONObjectOrArray('{"a":1}');  // => true
 * isValidJSONObjectOrArray('[1,2]');    // => true
 * isValidJSONObjectOrArray('{a:1}');    // => false — unquoted key
 * isValidJSONObjectOrArray('123');      // => false — primitive
 * isValidJSONObjectOrArray('{' + ' '.repeat(50000)); // => false, in microseconds
 *
 * @param {*} value Value to inspect. Non-strings short-circuit to `false`.
 * @returns {boolean} `true` only for a string that parses to a non-null object
 *   or an array.
 */
function isValidJSONObjectOrArray(value) {
	if (typeof value !== 'string') return false;

	let parsed;

	try {
		parsed = JSON.parse(value);
	} catch {
		return false;
	}

	return typeof parsed === 'object' && parsed !== null;
}

export { isValidJSONObjectOrArray };
