/**
 * @file Unit tests for fbType — type-based exclusion across all three rigor
 * levels.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { fbType } from '../../src/index.js';

describe('fbType', () => {

	describe('rigor 1 — plain typeof', () => {

		it('defaults to rigor 1 when no rigor is given', () => {
			// Arrange: 'nan' is only selectable from rigor 2 upward, so if the
			// default were anything else this would not throw.
			assert.throws(() => fbType([1], ['nan']), /only those allowed at the selected rigor/);
		});

		it('removes strings', () => {
			assert.deepStrictEqual(fbType([1, 'a', true], ['str'], { rigor: 1 }), [1, true]);
		});

		it('removes numbers, NaN and Infinity alike', () => {
			// typeof cannot tell them apart at this level.
			assert.deepStrictEqual(fbType([1, NaN, Infinity, 'keep'], ['num'], { rigor: 1 }), ['keep']);
		});

		it('removes booleans', () => {
			assert.deepStrictEqual(fbType([true, false, 'keep'], ['bln'], { rigor: 1 }), ['keep']);
		});

		it('removes functions', () => {
			// Arrange
			const data = [() => {}, 'keep'];

			// Act
			const result = fbType(data, ['fun'], { rigor: 1, inPlace: true });

			// Assert
			assert.deepStrictEqual(result, ['keep']);
		});

		it('removes bigints and symbols', () => {
			assert.deepStrictEqual(fbType([9n, 'keep'], ['bi'], { rigor: 1, inPlace: true }), ['keep']);
			assert.deepStrictEqual(fbType([Symbol('s'), 'keep'], ['smbl'], { rigor: 1, inPlace: true }), ['keep']);
		});

		it('treats null, arrays and objects all as object', () => {
			// The defining limitation of rigor 1 — everything typeof reports as
			// 'object' goes at once, and containers are removed rather than walked.
			assert.deepStrictEqual(fbType([1, 'a', null, [1], { b: 2 }], ['obj'], { rigor: 1 }), [1, 'a']);
		});

		it('rejects type names that need finer detection', () => {
			for (const alias of ['nl', 'uf', 'arr', 'nan', 'ifty', 'tru', 'emptystr']) {
				assert.throws(
					() => fbType([1], [alias], { rigor: 1 }),
					/only those allowed at the selected rigor/,
					`${alias} should not be selectable at rigor 1`
				);
			}
		});

	});

	describe('rigor 2 — strict native types', () => {

		it('separates number from NaN and Infinity', () => {
			assert.deepStrictEqual(fbType([1, NaN, Infinity], ['num'], { rigor: 2 }), [NaN, Infinity]);
		});

		it('removes NaN on its own', () => {
			assert.deepStrictEqual(fbType([1, NaN, 2], ['nan'], { rigor: 2 }), [1, 2]);
		});

		it('removes Infinity on its own', () => {
			assert.deepStrictEqual(fbType([1, Infinity], ['ifty'], { rigor: 2 }), [1]);
		});

		it('separates null from object', () => {
			assert.deepStrictEqual(fbType([null, { a: 1 }, [1]], ['nl'], { rigor: 2 }), [{ a: 1 }, [1]]);
		});

		it('separates array from object', () => {
			assert.deepStrictEqual(fbType([[1], { a: 1 }, 'x'], ['arr'], { rigor: 2 }), [{ a: 1 }, 'x']);
			assert.deepStrictEqual(fbType([[1], { a: 1 }, 'x'], ['obj'], { rigor: 2 }), [[1], 'x']);
		});

		it('removes undefined', () => {
			assert.deepStrictEqual(fbType([undefined, 'keep'], ['uf'], { rigor: 2 }), ['keep']);
		});

		it('distinguishes true from false', () => {
			assert.deepStrictEqual(fbType([true, false, 1], ['tru'], { rigor: 2 }), [false, 1]);
			assert.deepStrictEqual(fbType([true, false, 1], ['fls'], { rigor: 2 }), [true, 1]);
		});

		it('matches parseable date strings', () => {
			assert.deepStrictEqual(fbType(['2020-01-01', 'not a date'], ['date'], { rigor: 2 }), ['not a date']);
		});

		it('does not treat stringified values as their type', () => {
			// The line between rigor 2 and rigor 3.
			assert.deepStrictEqual(fbType([1, '1'], ['num'], { rigor: 2 }), ['1']);
			assert.deepStrictEqual(fbType([true, 'true'], ['bln'], { rigor: 2 }), ['true']);
		});

	});

	describe('rigor 3 — stringified detection', () => {

		it('treats a numeric string as a number', () => {
			assert.deepStrictEqual(fbType([1, '1', 'x'], ['num'], { rigor: 3 }), ['x']);
			assert.deepStrictEqual(fbType(['-1.5', 'x'], ['num'], { rigor: 3 }), ['x']);
		});

		it('does not treat exponent notation as a number', () => {
			// numberRe is deliberately narrower than Number().
			assert.deepStrictEqual(fbType(['1e3', 1], ['num'], { rigor: 3 }), ['1e3']);
		});

		it('treats a boolean string as a boolean', () => {
			assert.deepStrictEqual(fbType([true, 'true', 'false', 'x'], ['bln'], { rigor: 3 }), ['x']);
		});

		it('treats a bracketed string as an array', () => {
			assert.deepStrictEqual(fbType([[1], '[1,2]', 'x'], ['arr'], { rigor: 3 }), ['x']);
		});

		it('treats a braced string as an object', () => {
			assert.deepStrictEqual(fbType([{ a: 1 }, '{a:1}', 'x'], ['obj'], { rigor: 3 }), ['x']);
		});

		it('treats stringified null, NaN, Infinity and bigint as their type', () => {
			assert.deepStrictEqual(fbType([null, 'null', 'x'], ['nl'], { rigor: 3 }), ['x']);
			assert.deepStrictEqual(fbType([NaN, 'NaN', 'x'], ['nan'], { rigor: 3 }), ['x']);
			assert.deepStrictEqual(fbType([Infinity, 'Infinity', 'x'], ['ifty'], { rigor: 3 }), ['x']);
			assert.deepStrictEqual(fbType([9n, '9n', 'x'], ['bi'], { rigor: 3, inPlace: true }), ['x']);
		});

		it('stops matching strings that parse as JSON containers as string', () => {
			assert.deepStrictEqual(fbType(['{"a":1}', 'plain'], ['str'], { rigor: 3 }), ['{"a":1}']);
			assert.deepStrictEqual(fbType(['[1,2]', 'plain'], ['str'], { rigor: 3 }), ['[1,2]']);
		});

		describe('empty aliases', () => {

			it('emptystr matches only the empty string', () => {
				assert.deepStrictEqual(fbType(['', '   ', 'x'], ['emptystr'], { rigor: 3 }), ['   ', 'x']);
			});

			it('ss matches whitespace-only strings but not the empty string', () => {
				assert.deepStrictEqual(fbType(['', '   ', 'x'], ['ss'], { rigor: 3 }), ['', 'x']);
			});

			it('ss? matches both', () => {
				assert.deepStrictEqual(fbType(['', '   ', 'x'], ['ss?'], { rigor: 3 }), ['x']);
			});

			it('[s?] matches only empty arrays', () => {
				assert.deepStrictEqual(fbType([[], [1], 'x'], ['[s?]'], { rigor: 3 }), [[1], 'x']);
			});

			it('{s?} matches only empty objects', () => {
				assert.deepStrictEqual(fbType([{}, { a: 1 }, 'x'], ['{s?}'], { rigor: 3 }), [{ a: 1 }, 'x']);
			});

		});

		it('known overlap: brace-wrapped text that is not valid JSON matches both obj and str', () => {
			// `object` and `array` use the loose shape tests in regexBook, while
			// the `string` exclusion parses strictly (issue #21). So '{a:1}' is
			// object-shaped but not parseable, and satisfies both aliases.
			assert.deepStrictEqual(fbType(['{a:1}', 'keep'], ['obj'], { rigor: 3 }), ['keep']);
			assert.deepStrictEqual(fbType(['{a:1}', 'keep'], ['str'], { rigor: 3 }), []);
		});

		it('valid JSON is excluded from str, so the two no longer overlap there', () => {
			assert.deepStrictEqual(fbType(['{"a":1}', 'keep'], ['obj'], { rigor: 3 }), ['keep']);
			assert.deepStrictEqual(fbType(['{"a":1}', 'keep'], ['str'], { rigor: 3 }), ['{"a":1}']);
		});

	});

	describe('containers and traversal', () => {

		it('walks into nested arrays instead of removing them', () => {
			assert.deepStrictEqual(fbType([1, [2, 'keep']], ['num'], { rigor: 2 }), [['keep']]);
		});

		it('walks into nested objects', () => {
			assert.deepStrictEqual(
				fbType({ a: 1, b: { c: 2, d: 'keep' } }, ['num'], { rigor: 2 }),
				{ b: { d: 'keep' } }
			);
		});

		it('crosses between array and object containers', () => {
			assert.deepStrictEqual(
				fbType([{ a: 1, b: 'keep' }], ['num'], { rigor: 2 }),
				[{ b: 'keep' }]
			);
		});

		it('stops at the depth limit', () => {
			assert.deepStrictEqual(fbType([1, [2, [3]]], ['num'], { rigor: 2, depth: 1 }), [[2, [3]]]);
			assert.deepStrictEqual(fbType([1, [2, [3]]], ['num'], { rigor: 2, depth: 2 }), [[[3]]]);
			assert.deepStrictEqual(fbType([1, [2, [3]]], ['num'], { rigor: 2 }), [[[]]]);
		});

	});

	describe('options', () => {

		it('clones by default, leaving the caller data untouched', () => {
			// Arrange
			const original = [1, 2, 'a'];

			// Act
			const result = fbType(original, ['num'], { rigor: 2 });

			// Assert
			assert.deepStrictEqual(original, [1, 2, 'a']);
			assert.deepStrictEqual(result, ['a']);
		});

		it('mutates in place when asked', () => {
			// Arrange
			const original = [1, 2, 'a'];

			// Act
			const result = fbType(original, ['num'], { rigor: 2, inPlace: true });

			// Assert
			assert.strictEqual(result, original);
			assert.deepStrictEqual(original, ['a']);
		});

		it('mutates nested containers in place too', () => {
			// Arrange
			const original = [[1, 'a'], [2, 'b']];

			// Act
			fbType(original, ['num'], { rigor: 2, inPlace: true });

			// Assert
			assert.deepStrictEqual(original, [['a'], ['b']]);
		});

		it('needs inPlace for containers holding non-cloneable members', () => {
			assert.throws(() => fbType([Symbol('s'), 1], ['num'], { rigor: 2 }), /unable to clone your array/);
			assert.doesNotThrow(() => fbType([Symbol('s'), 1], ['num'], { rigor: 2, inPlace: true }));
		});

	});

	describe('criteria handling', () => {

		it('applies several types in one call', () => {
			assert.deepStrictEqual(fbType([1, 'a', true], ['num', 'str'], { rigor: 2 }), [true]);
		});

		it('collapses duplicate types', () => {
			assert.deepStrictEqual(fbType([1, 'a'], ['num', 'num', 'num'], { rigor: 1 }), ['a']);
		});

		it('accepts canonical names as well as shorthand', () => {
			assert.deepStrictEqual(fbType([1, 'a'], ['number'], { rigor: 2 }), ['a']);
		});

		it('accepts any casing and surrounding whitespace', () => {
			assert.deepStrictEqual(fbType([1, 'a'], ['  NUM  '], { rigor: 2 }), ['a']);
		});

		it('returns the container untouched for an empty type list', () => {
			// Arrange
			const original = [1, 2];

			// Act
			const result = fbType(original, []);

			// Assert
			assert.strictEqual(result, original);
		});

	});

	describe('errors', () => {

		it('rejects a rigor above 3', () => {
			assert.throws(() => fbType([1], ['num'], { rigor: 4 }), /Rigor must be 1\/2\/3/);
		});

		it('rejects an unknown type name', () => {
			assert.throws(() => fbType([1], ['not-a-type']), /only those allowed at the selected rigor/);
		});

		it('rejects a non-string type name', () => {
			// Numbers stringify to something the translator cannot resolve.
			assert.throws(() => fbType([1], [1]), /only those allowed at the selected rigor/);
		});

		it('rejects more distinct types than the rigor allows', () => {
			// Arrange: rigor 1 offers seven names, so eight distinct entries is too many
			const tooMany = ['str', 'num', 'bln', 'fun', 'obj', 'bi', 'smbl', 'string'];

			// Assert
			assert.throws(() => fbType([1], tooMany, { rigor: 1 }), /Types is more than 7/);
		});

		it('rejects an unsupported container', () => {
			for (const value of ['text', 5, null, true]) {
				assert.throws(() => fbType(value, ['num']), /Unsupported type/, `${String(value)} should be rejected`);
			}
		});

		it('rejects an empty container', () => {
			assert.throws(() => fbType([], ['num']), /Array length is less than 1/);
			assert.throws(() => fbType({}, ['num']), /Object items is less than 1/);
		});

		it('rejects malformed options', () => {
			assert.throws(() => fbType([1], ['num'], { inPlace: 'yes' }), /In place \(inPlace\) option must be boolean/);
			assert.throws(() => fbType([1], ['num'], { depth: 1.5 }), /depth option must be integer or infinity/);
		});

	});

	describe('known gaps', () => {

		it('should reject rigor 0 rather than silently treating it as rigor 1',
			{ todo: 'see issue #29 — options.rigor || 1 turns 0 into 1, so the rigor < 1 guard is unreachable' },
			() => {
				assert.throws(() => fbType([1], ['num'], { rigor: 0 }), /Rigor must be 1\/2\/3/);
			});

		it('should accept a bare string type name, as the README documents',
			{ todo: 'validateAndTranslateInput writes back into the input, which fails on an immutable string' },
			() => {
				assert.deepStrictEqual(fbType([1, 'a'], 'num', { rigor: 2 }), ['a']);
			});

	});

});
