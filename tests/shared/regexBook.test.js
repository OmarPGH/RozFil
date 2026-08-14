/**
 * @file Unit tests for the regular expression repository.
 *
 * These patterns drive rigor 3 stringified type detection. They are shape
 * tests rather than parsers, so the cases below pin down both what they match
 * and what they deliberately do not.
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

	describe('jsonObjArrRe', () => {

		it('matches a stringified object, or an array of objects', () => {
			expectMatches(reBook.jsonObjArrRe, ['{a:1}', '{}', '[{a:1}]', '[{}]'], []);
		});

		it('rejects plain text', () => {
			expectMatches(reBook.jsonObjArrRe, [], ['plain', 'a:1']);
		});

		it('does not match a bare stringified array', () => {
			// Documents current behaviour: arrRe matches '[1,2]' but this one
			// does not, so '[1,2]' is selectable as both `str` and `arr` at
			// rigor 3. See the overlap test in filters/filterByType.test.js.
			expectMatches(reBook.jsonObjArrRe, [], ['[1,2]']);
		});

	});

});
