/**
 * @file Unit tests for the regular expression repository.
 *
 * These patterns drive rigor 3 stringified type detection. They are shape
 * tests rather than parsers, so the cases below pin down both what they match
 * and what they deliberately do not.
 *
 * Stringified-JSON detection no longer lives here — see
 * tests/shared/jsonValidator.test.js.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import * as reBook from '../../src/shared/regexBook.js';

/**
 * Asserts a pattern's verdict across a batch of inputs.
 *
 * @param {RegExp} pattern Pattern under test.
 * @param {string[]} shouldMatch Inputs expected to match.
 * @param {string[]} shouldNotMatch Inputs expected not to match.
 */
function expectMatches(pattern, shouldMatch, shouldNotMatch) {
	for (const value of shouldMatch) {
		assert.ok(pattern.test(value), `expected ${JSON.stringify(value)} to match`);
	}
	for (const value of shouldNotMatch) {
		assert.ok(!pattern.test(value), `expected ${JSON.stringify(value)} not to match`);
	}
}

describe('regexBook', () => {

	describe('numberRe', () => {

		it('matches signed integers and decimals', () => {
			expectMatches(reBook.numberRe, ['0', '12', '-12', '1.5', '-1.5'], []);
		});

		it('rejects notation Number() would still accept', () => {
			// Narrower than Number() on purpose: these stay strings at rigor 3.
			expectMatches(reBook.numberRe, [], ['1e3', '0x1f', 'Infinity', '.5', '1.']);
		});

		it('rejects non-numeric text and the empty string', () => {
			expectMatches(reBook.numberRe, [], ['x', '', '12n', '1 2']);
		});

	});

	describe('bigintRe', () => {

		it('matches a BigInt literal written as text', () => {
			expectMatches(reBook.bigintRe, ['12n', '-3n', '0n'], []);
		});

		it('rejects a plain integer with no suffix', () => {
			expectMatches(reBook.bigintRe, [], ['12', 'n', 'x', '1.5n']);
		});

	});

	describe('arrRe', () => {

		it('matches square-bracket-wrapped text, including empty', () => {
			expectMatches(reBook.arrRe, ['[1,2]', '[]', '[ anything ]'], []);
		});

		it('rejects unbalanced or unwrapped text', () => {
			expectMatches(reBook.arrRe, [], ['x', '[1,2', '1,2]']);
		});

	});

	describe('objectRe', () => {

		it('matches curly-brace-wrapped text, including empty', () => {
			expectMatches(reBook.objectRe, ['{a:1}', '{}', '{ anything }'], []);
		});

		it('rejects unbalanced or unwrapped text', () => {
			expectMatches(reBook.objectRe, [], ['x', '{a:1', 'a:1}']);
		});

	});

	describe('emptyStringWithSpacesRe', () => {

		it('matches whitespace-only strings', () => {
			expectMatches(reBook.emptyStringWithSpacesRe, [' ', '   ', '\t', '\n', '\t\n '], []);
		});

		it('rejects the empty string, which is what separates it from emptyString', () => {
			expectMatches(reBook.emptyStringWithSpacesRe, [], ['']);
		});

		it('rejects strings with any non-whitespace character', () => {
			expectMatches(reBook.emptyStringWithSpacesRe, [], ['x', ' x ']);
		});

	});

	describe('no backtracking hazards remain', () => {

		// jsonObjArrRe was removed in favour of a JSON.parse based validator
		// after it was found vulnerable to polynomial ReDoS (issue #21). Guard
		// against a similar pattern being reintroduced here.
		/** Inputs shaped to trigger backtracking in brace/bracket patterns. */
		const HOSTILE = [
			'{' + ' '.repeat(50000),
			'[{' + ' '.repeat(50000),
			'{' + ' '.repeat(25000) + '}' + ' '.repeat(25000),
			'['.repeat(25000),
			' '.repeat(50000),
			'-'.repeat(50000),
			'9'.repeat(50000) + 'x',
		];

		for (const [name, pattern] of Object.entries(reBook)) {
			it(`${name} resists hostile input`, () => {
				// Act
				const started = process.hrtime.bigint();
				for (const payload of HOSTILE) pattern.test(payload);
				const elapsed = Number(process.hrtime.bigint() - started) / 1e6;

				// Assert: the removed pattern needed ~115s for a single 8k input,
				// so anything linear clears this by orders of magnitude.
				assert.ok(elapsed < 1000, `${name} took ${elapsed.toFixed(1)}ms`);
			});
		}

		it('no longer exports jsonObjArrRe', () => {
			assert.strictEqual(reBook.jsonObjArrRe, undefined);
		});

	});

});
