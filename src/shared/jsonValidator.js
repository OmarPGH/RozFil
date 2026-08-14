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
 *
 * As of issue #33 this module is the single authority for deciding whether a
 * string represents a container. The `array`, `object` and `string` aliases at
 * rigor 3 all route through it, so a value can never satisfy two of them at
 * once — which is what the loose `arrRe` / `objectRe` shape tests allowed.
 */

/**
 * Identifies which kind of JSON container a string represents.
 *
 * Returns the kind rather than a boolean so that `array` and `object` can be
 * told apart. A single boolean would make both aliases match both kinds, which
 * is worse than the shape tests this replaced.
 *
 * A valid JSON container must begin with `{` or `[` once trimmed, so anything
 * else is rejected before `JSON.parse` is called at all. That is not just an
 * optimisation: throwing and catching is far more expensive than the parse
 * itself, and at rigor 3 this runs against every string in the container.
 *
 * @example
 * jsonKindOf('{"a":1}');  // => 'object'
 * jsonKindOf('[1,2]');    // => 'array'
 * jsonKindOf('{a:1}');    // => null — unquoted key, not valid JSON
 * jsonKindOf('123');      // => null — a primitive, not a container
 * jsonKindOf(42);         // => null — not a string at all
 *
 * @param {*} value Value to inspect. Non-strings short-circuit to `null`.
 * @returns {'object' | 'array' | null} The container kind, or `null` when the
 *   string is not well-formed JSON or parses to a primitive.
 */
function jsonKindOf(value) {
	if (typeof value !== 'string') return null;

	const trimmed = value.trim();
	const first = trimmed.charCodeAt(0);

	// 123 is '{', 91 is '['. An empty string yields NaN, which fails both.
	if (first !== 123 && first !== 91) return null;

	let parsed;

	try {
		parsed = JSON.parse(trimmed);
	} catch {
		return null;
	}

	// The opening-character guard means a successful parse can only have
	// produced one of the two container kinds.
	return Array.isArray(parsed) ? 'array' : 'object';
}

/**
 * Reports whether a string parses as a JSON object or array.
 *
 * Deliberately stricter than a shape test: the string must be well-formed
 * JSON, not merely brace-wrapped. `'{a:1}'` is rejected because JSON requires
 * quoted keys, while `'{"a":1}'` is accepted.
 *
 * Primitives are rejected even though `JSON.parse` accepts them — `'123'`,
 * `'true'`, `'null'` and `'"text"'` all parse without throwing, and each is
 * turned away by {@link jsonKindOf} before parsing is attempted.
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
	return jsonKindOf(value) !== null;
}

export { jsonKindOf, isValidJSONObjectOrArray };
