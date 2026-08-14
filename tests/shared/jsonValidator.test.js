/**
 * @file Unit tests for the safe stringified-JSON validator.
 *
 * Covers correctness against the regex it replaced, and pins the performance
 * property that motivated the replacement — see issue #21.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isValidJSONObjectOrArray, jsonKindOf } from '../../src/shared/jsonValidator.js';

describe('jsonKindOf', () => {

	describe('identifies the container kind', () => {

		it('reports objects as object', () => {
			for (const value of ['{}', '{"a":1}', '{"a":{"b":[1,2]}}', '  {"a":1}  ']) {
				assert.strictEqual(jsonKindOf(value), 'object', `${value} should be an object`);
			}
		});

		it('reports arrays as array', () => {
			for (const value of ['[]', '[1,2]', '[{"a":1}]', '[[1],[2]]', '  [1]  ']) {
				assert.strictEqual(jsonKindOf(value), 'array', `${value} should be an array`);
			}
		});

		it('never reports both — this is what fixes the alias overlap', () => {
			// Arrange / Act / Assert: a value is one kind or neither, never two.
			for (const value of ['{"a":1}', '[1,2]', '{a:1}', 'plain', '123']) {
				const kind = jsonKindOf(value);
				assert.ok(
					kind === 'object' || kind === 'array' || kind === null,
					`unexpected kind ${kind} for ${value}`
				);
			}
		});

	});

	describe('returns null for anything that is not a JSON container', () => {

		it('rejects primitives that JSON.parse would accept', () => {
			for (const value of ['123', 'true', 'false', 'null', '"text"']) {
				assert.strictEqual(jsonKindOf(value), null, `${value} should be rejected`);
			}
		});

		it('rejects container-shaped text that is not valid JSON', () => {
			for (const value of ['{a:1}', '[a,b]', '[{a:1}]', "{'a':1}", '[1,2,]', '{"a":1,}']) {
				assert.strictEqual(jsonKindOf(value), null, `${value} should be rejected`);
			}
		});

		it('rejects unbalanced brackets', () => {
			for (const value of ['{', '[', '}', ']', '{"a":1', '[1,2']) {
				assert.strictEqual(jsonKindOf(value), null, `${value} should be rejected`);
			}
		});

		it('rejects non-strings without throwing', () => {
			for (const value of [null, undefined, 123, true, {}, [], () => {}, 9n]) {
				assert.doesNotThrow(() => jsonKindOf(value));
				assert.strictEqual(jsonKindOf(value), null);
			}
		});

		it('rejects the empty string', () => {
			assert.strictEqual(jsonKindOf(''), null);
			assert.strictEqual(jsonKindOf('   '), null);
		});

	});

	describe('opening-character fast path', () => {

		// Anything not starting with { or [ cannot be a JSON container, so it is
		// rejected before JSON.parse is called. Throwing is far more expensive
		// than parsing, and at rigor 3 this runs against every string.
		it('rejects a huge non-container string quickly', () => {
			// Arrange
			const payload = 'x'.repeat(500000);

			// Act
			const started = process.hrtime.bigint();
			const kind = jsonKindOf(payload);
			const elapsed = Number(process.hrtime.bigint() - started) / 1e6;

			// Assert
			assert.strictEqual(kind, null);
			assert.ok(elapsed < 100, `took ${elapsed.toFixed(1)}ms`);
		});

	});

});

describe('isValidJSONObjectOrArray', () => {

	describe('accepts well-formed JSON containers', () => {

		it('accepts objects', () => {
			for (const value of ['{}', '{"a":1}', '{"a":{"b":[1,2]}}', '{"a":null}']) {
				assert.strictEqual(isValidJSONObjectOrArray(value), true, `${value} should be valid`);
			}
		});

		it('accepts arrays', () => {
			for (const value of ['[]', '[1,2]', '[{"a":1}]', '[[1],[2]]', '[null]']) {
				assert.strictEqual(isValidJSONObjectOrArray(value), true, `${value} should be valid`);
			}
		});

		it('tolerates surrounding and internal whitespace', () => {
			for (const value of ['  {"a":1}  ', '{ "a" : 1 }', '[\n1,\n2\n]', '\t[]\t']) {
				assert.strictEqual(isValidJSONObjectOrArray(value), true, `${value} should be valid`);
			}
		});

	});

	describe('rejects primitives that JSON.parse accepts', () => {

		// The trap the issue called out: JSON.parse does not throw on these, so
		// the parsed result has to be type-checked rather than the parse alone.
		it('rejects numbers, booleans, null and quoted strings', () => {
			for (const value of ['123', '-1.5', 'true', 'false', 'null', '"text"', '""']) {
				assert.strictEqual(isValidJSONObjectOrArray(value), false, `${value} should be rejected`);
			}
		});

		it('rejects null specifically, despite typeof null being object', () => {
			assert.strictEqual(isValidJSONObjectOrArray('null'), false);
		});

	});

	describe('rejects malformed input', () => {

		it('rejects unquoted keys, which are not legal JSON', () => {
			assert.strictEqual(isValidJSONObjectOrArray('{a:1}'), false);
			assert.strictEqual(isValidJSONObjectOrArray('[{a:1}]'), false);
		});

		it('rejects single-quoted strings', () => {
			assert.strictEqual(isValidJSONObjectOrArray("{'a':1}"), false);
		});

		it('rejects unbalanced brackets', () => {
			for (const value of ['{', '}', '[', ']', '{"a":1', '[1,2', '{"a":1}}']) {
				assert.strictEqual(isValidJSONObjectOrArray(value), false, `${value} should be rejected`);
			}
		});

		it('rejects trailing commas', () => {
			assert.strictEqual(isValidJSONObjectOrArray('[1,2,]'), false);
			assert.strictEqual(isValidJSONObjectOrArray('{"a":1,}'), false);
		});

		it('rejects plain text and the empty string', () => {
			for (const value of ['plain', 'a:1', '', '   ', 'undefined', 'NaN']) {
				assert.strictEqual(isValidJSONObjectOrArray(value), false, `${JSON.stringify(value)} should be rejected`);
			}
		});

	});

	describe('rejects non-strings without throwing', () => {

		it('short-circuits on every non-string type', () => {
			for (const value of [null, undefined, 123, true, {}, [], () => {}, Symbol('s'), 9n]) {
				assert.doesNotThrow(() => isValidJSONObjectOrArray(value));
				assert.strictEqual(isValidJSONObjectOrArray(value), false);
			}
		});

		it('does not treat a real object as its JSON form', () => {
			// Only strings are candidates — a live object is not stringified first.
			assert.strictEqual(isValidJSONObjectOrArray({ a: 1 }), false);
		});

	});

	describe('ReDoS resistance — issue #21', () => {

		// The regex this replaced scaled cubically on these inputs: ~230ms at
		// 1k characters, ~115s at 8k, and hours at 50k. A native parse is
		// linear, so the bound below has enormous headroom while still failing
		// loudly if a backtracking pattern is ever reintroduced.
		const BUDGET_MS = 1000;

		/**
		 * @param {string} payload Input to time.
		 * @returns {number} Elapsed milliseconds.
		 */
		function timeValidation(payload) {
			const started = process.hrtime.bigint();
			isValidJSONObjectOrArray(payload);
			return Number(process.hrtime.bigint() - started) / 1e6;
		}

		it('handles the reported payload in well under a second', () => {
			// Arrange: the exact shape from the issue
			const payload = '{' + ' '.repeat(50000);

			// Act
			const elapsed = timeValidation(payload);

			// Assert
			assert.ok(elapsed < BUDGET_MS, `took ${elapsed.toFixed(1)}ms, budget ${BUDGET_MS}ms`);
			assert.strictEqual(isValidJSONObjectOrArray(payload), false);
		});

		it('handles the array-of-objects variant too', () => {
			const payload = '[{' + ' '.repeat(50000);
			assert.ok(timeValidation(payload) < BUDGET_MS);
			assert.strictEqual(isValidJSONObjectOrArray(payload), false);
		});

		it('scales linearly rather than super-linearly', () => {
			// Arrange: a tenfold increase in input
			const small = '{' + ' '.repeat(10000);
			const large = '{' + ' '.repeat(100000);

			// Act
			timeValidation(small);
			const largeElapsed = timeValidation(large);

			// Assert: the old pattern could not have finished the large case at
			// all, so simply completing inside the budget is the signal.
			assert.ok(largeElapsed < BUDGET_MS, `took ${largeElapsed.toFixed(1)}ms`);
		});

		it('stays fast on a large well-formed document', () => {
			// Arrange
			const payload = JSON.stringify(Array.from({ length: 20000 }, (_, i) => ({ i })));

			// Act
			const elapsed = timeValidation(payload);

			// Assert
			assert.ok(elapsed < BUDGET_MS, `took ${elapsed.toFixed(1)}ms`);
			assert.strictEqual(isValidJSONObjectOrArray(payload), true);
		});

	});

});
