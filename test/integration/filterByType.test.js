import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fbType } from '../../src/index.js';

describe('fbType - rigor 1 (loose typeof matching)', () => {
	it('excludes items matching typeof, keeps the rest', () => {
		const result = fbType(['str', 1, NaN, '5', '[]', '{}'], ['string', 'number'], { rigor: 1 });
		assert.deepEqual(result, []);
		// NaN and 1 are both typeof 'number', '[]'/'{}' are typeof 'string' here -> all removed
	});

	it('excludes a native boolean by strict typeof match at rigor 2', () => {
		assert.deepEqual(fbType([true, false, 1, 'a'], ['boolean'], { rigor: 2 }), [1, 'a']);
	});

	it('excludes a real function by strict typeof match at rigor 2 (requires inPlace)', () => {
		const fn = () => {};
		assert.deepEqual(fbType([fn, 1, 'a'], ['function'], { rigor: 2, inPlace: true }), [1, 'a']);
	});

	it('is the default rigor when options are omitted', () => {
		const withDefault = fbType(['a', 1, true], ['string']);
		const withExplicit = fbType(['a', 1, true], ['string'], { rigor: 1 });
		assert.deepEqual(withDefault, withExplicit);
	});

	it('excludes booleans by typeof', () => {
		assert.deepEqual(fbType([true, false, 1, 'a'], ['boolean'], { rigor: 1 }), [1, 'a']);
	});

	it('excludes functions by typeof when inPlace is true (structuredClone cannot clone functions)', () => {
		// KNOWN LIMITATION: by default (inPlace: false) fbType clones via structuredClone,
		// which throws on non-cloneable values like functions -- even when the function
		// itself is the thing being filtered out. inPlace: true skips the clone step.
		const fn = () => {};
		assert.deepEqual(fbType([fn, 1, 'a'], ['function'], { rigor: 1, inPlace: true }), [1, 'a']);
	});

	it('throws a clone error for functions in array when inPlace is false (documents current behavior)', () => {
		const fn = () => {};
		assert.throws(() => fbType([fn, 1, 'a'], ['function'], { rigor: 1 }), /unable to clone your array/);
	});

	it('rigor 1 does not allow "array"/"null"/"undefined" as filter types (not in allowed list)', () => {
		assert.throws(() => fbType([1, 2], ['array'], { rigor: 1 }), /Type Error/);
		assert.throws(() => fbType([1, 2], ['null'], { rigor: 1 }), /Type Error/);
	});
});

describe('fbType - rigor 2 (strict native type differentiation)', () => {
	it('distinguishes NaN from number', () => {
		const result = fbType(['str', 1, NaN, '5', '[]', '{}'], ['string', 'number'], { rigor: 2 });
		assert.deepEqual(result, [NaN]);
	});

	it('distinguishes array from object', () => {
		const result = fbType([[1, 2], { a: 1 }, 'x'], ['array'], { rigor: 2 });
		assert.deepEqual(result, [{ a: 1 }, 'x']);
	});

	it('excludes null explicitly', () => {
		assert.deepEqual(fbType([null, 1, 'a'], ['null'], { rigor: 2 }), [1, 'a']);
	});

	it('excludes undefined explicitly', () => {
		assert.deepEqual(fbType([undefined, 1, 'a'], ['undefined'], { rigor: 2 }), [1, 'a']);
	});

	it('excludes a plain object as "object" (not array, not null)', () => {
		assert.deepEqual(fbType([{ a: 1 }, [1, 2], 'x'], ['object'], { rigor: 2 }), [[1, 2], 'x']);
	});

	it('excludes NaN as "NaN" type', () => {
		assert.deepEqual(fbType([NaN, 1, 2], ['NaN'], { rigor: 2 }), [1, 2]);
	});

	it('excludes a bigint as "bigint" type', () => {
		assert.deepEqual(fbType([10n, 1, 2], ['bigint'], { rigor: 2 }), [1, 2]);
	});

	it('excludes a symbol as "symbol" type (requires inPlace: structuredClone cannot clone symbols)', () => {
		const sym = Symbol('x');
		assert.deepEqual(fbType([sym, 1, 2], ['symbol'], { rigor: 2, inPlace: true }), [1, 2]);
	});

	it('excludes a valid date string as "date" type', () => {
		assert.deepEqual(fbType(['2024-01-01', 'hello', 5], ['date'], { rigor: 2 }), ['hello', 5]);
	});

	it('excludes Infinity as its own type, distinct from number', () => {
		assert.deepEqual(fbType([Infinity, 1, 2], ['Infinity'], { rigor: 2 }), [1, 2]);
		// 'number' should NOT match Infinity at rigor 2
		assert.deepEqual(fbType([Infinity, 1, 2], ['number'], { rigor: 2 }), [Infinity]);
	});

	it('excludes true/false as distinct sub-types of boolean', () => {
		assert.deepEqual(fbType([true, false, 1], ['true'], { rigor: 2 }), [false, 1]);
		assert.deepEqual(fbType([true, false, 1], ['false'], { rigor: 2 }), [true, 1]);
	});

	it('recognizes valid date strings but does NOT match plain non-date strings', () => {
		assert.deepEqual(fbType(['2024-01-01', 'hello'], ['date'], { rigor: 2 }), ['hello']);
	});

	it('rigor 2 rejects stringified types (that is rigor 3 behavior)', () => {
		// '123' is a string, not a number, at rigor 2
		assert.deepEqual(fbType(['123', 1], ['number'], { rigor: 2 }), ['123']);
	});
});

describe('fbType - rigor 3 (smart stringified type detection)', () => {
	it('detects stringified numbers', () => {
		assert.deepEqual(fbType(['123', 'abc', 1], ['number'], { rigor: 3 }), ['abc']);
	});

	it('detects stringified booleans', () => {
		assert.deepEqual(fbType(['true', 'false', 'abc'], ['boolean'], { rigor: 3 }), ['abc']);
	});

	it('detects stringified arrays and objects together with "object" type', () => {
		const result = fbType(['str', 1, NaN, '5', '[]', '{}'], ['string', 'number', 'object'], { rigor: 3 });
		assert.deepEqual(result, [NaN, '[]']);
	});

	it('detects a stringified array', () => {
		assert.deepEqual(fbType(['[1,2,3]', 'not-array'], ['array'], { rigor: 3 }), ['not-array']);
	});

	it('detects a stringified object specifically via the JSON-string path (not the native-object path)', () => {
		// this exercises the `jsonValidator.isJsonObj(valueTrim)` branch of the 'object' check,
		// as opposed to the native `typeof value === 'object'` branch
		assert.deepEqual(fbType(['{"a":1}', 'not-json', 5], ['object'], { rigor: 3 }), ['not-json', 5]);
	});

	it('detects a native object at rigor 3 via the typeof path (not the stringified path)', () => {
		assert.deepEqual(fbType([{ a: 1 }, 'not-json', 5], ['object'], { rigor: 3 }), ['not-json', 5]);
	});

	it('does not match a string that looks like an array as "object" at rigor 3', () => {
		assert.deepEqual(fbType(['[1,2,3]', 5], ['object'], { rigor: 3 }), ['[1,2,3]', 5]);
	});

	it('detects a stringified null/undefined/NaN/Infinity', () => {
		assert.deepEqual(fbType(['null', 'x'], ['null'], { rigor: 3 }), ['x']);
		assert.deepEqual(fbType(['undefined', 'x'], ['undefined'], { rigor: 3 }), ['x']);
		assert.deepEqual(fbType(['NaN', 'x'], ['NaN'], { rigor: 3 }), ['x']);
		assert.deepEqual(fbType(['Infinity', 'x'], ['Infinity'], { rigor: 3 }), ['x']);
	});

	it('detects a bigint-style string via regex', () => {
		assert.deepEqual(fbType(['123n', '-45n', 'notabigint'], ['bigint'], { rigor: 3 }), ['notabigint']);
	});

	it('detects an empty string', () => {
		assert.deepEqual(fbType(['', 'a', '  '], ['emptyString'], { rigor: 3 }), ['a', '  ']);
	});

	it('detects a whitespace-only string', () => {
		assert.deepEqual(fbType(['   ', 'a', ''], ['emptyStringWithSpaces'], { rigor: 3 }), ['a', '']);
	});

	it('detects empty-or-whitespace string combined type', () => {
		assert.deepEqual(fbType(['', '  ', 'a'], ['emptyStringOrWithSpaces'], { rigor: 3 }), ['a']);
	});

	it('detects an empty array literal', () => {
		assert.deepEqual(fbType([[], [1], 'x'], ['emptyArray'], { rigor: 3 }), [[1], 'x']);
	});

	it('detects an empty object literal', () => {
		assert.deepEqual(fbType([{}, { a: 1 }, 'x'], ['emptyObject'], { rigor: 3 }), [{ a: 1 }, 'x']);
	});

	it('excludes an actual function value at rigor 3 (inPlace needed, see clone limitation)', () => {
		const fn = () => {};
		assert.deepEqual(fbType([fn, 1, 'a'], ['function'], { rigor: 3, inPlace: true }), [1, 'a']);
	});

	it('excludes an actual symbol value at rigor 3 (requires inPlace: structuredClone cannot clone symbols)', () => {
		const sym = Symbol('x');
		assert.deepEqual(fbType([sym, 1, 'a'], ['symbol'], { rigor: 3, inPlace: true }), [1, 'a']);
	});

	it('excludes a native boolean true (not just the stringified form) at rigor 3', () => {
		assert.deepEqual(fbType([true, false, 1], ['true'], { rigor: 3 }), [false, 1]);
	});

	it('excludes a native boolean false (not just the stringified form) at rigor 3', () => {
		assert.deepEqual(fbType([true, false, 1], ['false'], { rigor: 3 }), [true, 1]);
	});

	it('detects a valid native date string at rigor 3 (not just via other coercion paths)', () => {
		assert.deepEqual(fbType(['2024-01-01', 'not-a-date'], ['date'], { rigor: 3 }), ['not-a-date']);
	});
});

describe('fbType - invalid rigor / invalid type inputs', () => {
	it('throws when rigor is below 1', () => {
		assert.throws(() => fbType([1, 2], ['number'], { rigor: 0 }), /Rigor must be 1\/2\/3/);
	});

	it('throws when rigor is above 3', () => {
		assert.throws(() => fbType([1, 2], ['number'], { rigor: 4 }), /Rigor must be 1\/2\/3/);
	});

	it('throws for an unrecognized type alias', () => {
		assert.throws(() => fbType([1, 2], ['totallyMadeUp'], { rigor: 2 }), /Type Error/);
	});

	it('throws when passing more types than the allowed list length', () => {
		// allowed list at rigor 2 has 19 entries; use 20 *distinct* values
		// (sanitizeInput de-dupes via Set, so repeats of the same value wouldn't trigger this)
		const tooMany = [
			'string', 'number', 'boolean', 'undefined', 'function',
			'null', 'array', 'object', 'NaN', 'bigint',
			'Infinity', 'symbol', 'true', 'false', 'emptyString',
			'emptyStringWithSpaces', 'emptyStringOrWithSpaces', 'emptyObject', 'emptyArray', 'date',
		];
		assert.throws(() => fbType([1, 2], tooMany, { rigor: 1 }), /Types is more than/);
	});
});

describe('fbType - works on both arrays and objects', () => {
	it('filters values out of a plain object by type', () => {
		const result = fbType({ a: 1, b: 'x', c: 2 }, ['string'], { rigor: 1 });
		assert.deepEqual(result, { a: 1, c: 2 });
	});

	it('throws "Unsupported type" for a non-array non-object target (e.g. a string)', () => {
		assert.throws(() => fbType('not a collection', ['string']), /Unsupported type/);
	});
});

describe('fbType - depth option', () => {
	const nested = [1, 'a', [2, 'b', [3, 'c']]];

	it('with depth 1, only the top level is cleaned', () => {
		const result = fbType(nested, ['string'], { rigor: 1, depth: 1 });
		assert.deepEqual(result, [1, [2, 'b', [3, 'c']]]);
	});

	it('with depth 2, two levels are cleaned', () => {
		const result = fbType(nested, ['string'], { rigor: 1, depth: 2 });
		assert.deepEqual(result, [1, [2, [3, 'c']]]);
	});

	it('with no depth specified (default Infinity), fully recursive', () => {
		const result = fbType(nested, ['string'], { rigor: 1 });
		assert.deepEqual(result, [1, [2, [3]]]);
	});

	it('throws for a non-integer, non-Infinity depth', () => {
		assert.throws(() => fbType([1, 2], ['number'], { depth: 'deep' }), /depth option must be integer or infinity/);
	});
});

describe('fbType - inPlace option', () => {
	it('does not mutate the original array by default (inPlace: false)', () => {
		const original = [1, 'a', 2];
		const result = fbType(original, ['string'], { rigor: 1 });
		assert.deepEqual(original, [1, 'a', 2]);
		assert.deepEqual(result, [1, 2]);
		assert.notEqual(result, original);
	});

	it('mutates the original array when inPlace is true', () => {
		const original = [1, 'a', 2];
		const result = fbType(original, ['string'], { rigor: 1, inPlace: true });
		assert.equal(result, original);
		assert.deepEqual(original, [1, 2]);
	});

	it('throws when inPlace is not a boolean', () => {
		assert.throws(() => fbType([1, 2], ['number'], { inPlace: 'yes' }), /In place \(inPlace\) option must be boolean/);
	});
});

describe('fbType - empty data edge cases', () => {
	it('returns the array unchanged when the types list is empty', () => {
		assert.deepEqual(fbType([1, 'a'], []), [1, 'a']);
	});

	it('throws when the target array itself is empty', () => {
		assert.throws(() => fbType([], ['string']), /Array length is less than 1/);
	});

	it('throws when the target object itself is empty', () => {
		assert.throws(() => fbType({}, ['string']), /Object items is less than 1/);
	});
});

describe('fbType - duplicate type inputs are de-duplicated', () => {
	it('treats repeated types in the input array as a single type', () => {
		const result = fbType(['a', 1, 'b'], ['string', 'str', 'string'], { rigor: 1 });
		assert.deepEqual(result, [1]);
	});
});
