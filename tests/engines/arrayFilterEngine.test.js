/**
 * @file Unit tests for the array execution engine.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { arrayFilterEngine } from '../../src/engines/arrayFilterEngine.js';
import { isWalkable } from '../../src/shared/isWalkable.js';

/**
 * Drops values strictly equal to the criterion, descends into containers.
 *
 * @type {import('../../src/typedefs.js').FilterPredicate}
 */
const dropEqual = (key, value, currentInput) => {
	const walk = isWalkable(value);
	if (walk) return walk;
	return value === currentInput;
};

/**
 * Vocabulary used to exercise the translation branch.
 *
 * @type {import('../../src/typedefs.js').CanonicalType[]}
 */
const ALLOWED = ['string', 'number'];

describe('arrayFilterEngine', () => {

	describe('filtering', () => {

		it('removes matching elements and compacts the rest', () => {
			assert.deepStrictEqual(
				arrayFilterEngine([1, 'a', 2, 'b'], [1, 2], {}, dropEqual, undefined),
				['a', 'b']
			);
		});

		it('de-duplicates the criteria before applying them', () => {
			// Arrange: the same criterion three times should behave as one pass
			assert.deepStrictEqual(
				arrayFilterEngine([1, 'a', 1], [1, 1, 1], {}, dropEqual, undefined),
				['a']
			);
		});

		it('walks nested containers', () => {
			assert.deepStrictEqual(
				arrayFilterEngine([1, [1, 'keep'], { a: 1 }], [1], {}, dropEqual, undefined),
				[['keep'], {}]
			);
		});

	});

	describe('cloning', () => {

		it('leaves the caller array untouched by default', () => {
			// Arrange
			const original = [1, 'a'];

			// Act
			const result = arrayFilterEngine(original, [1], {}, dropEqual, undefined);

			// Assert
			assert.deepStrictEqual(original, [1, 'a']);
			assert.deepStrictEqual(result, ['a']);
			assert.notStrictEqual(result, original);
		});

		it('mutates the caller array when inPlace is true', () => {
			// Arrange
			const original = [1, 'a'];

			// Act
			const result = arrayFilterEngine(original, [1], { inPlace: true }, dropEqual, undefined);

			// Assert
			assert.strictEqual(result, original);
			assert.deepStrictEqual(original, ['a']);
		});

		it('surfaces a guided error on non-cloneable members', () => {
			assert.throws(
				() => arrayFilterEngine([Symbol('s'), 1], [1], {}, dropEqual, undefined),
				/unable to clone your array/
			);
		});

	});

	describe('validation', () => {

		it('rejects a non-array container', () => {
			assert.throws(() => arrayFilterEngine({ a: 1 }, [1], {}, dropEqual, undefined), /this isn't array/);
		});

		it('rejects an empty array', () => {
			assert.throws(() => arrayFilterEngine([], [1], {}, dropEqual, undefined), /Array length is less than 1/);
		});

		it('rejects malformed options before doing any work', () => {
			assert.throws(
				() => arrayFilterEngine([1], [1], { inPlace: 'yes' }, dropEqual, undefined),
				/In place \(inPlace\) option must be boolean/
			);
			assert.throws(
				() => arrayFilterEngine([1], [1], { depth: 1.5 }, dropEqual, undefined),
				/depth option must be integer or infinity/
			);
		});

		it('translates and validates criteria when a vocabulary is supplied', () => {
			// Arrange: 'num' should translate to 'number', which is allowed
			const matchCanonical = (key, value, currentInput) => value === currentInput;

			// Act
			const result = arrayFilterEngine(['number', 'keep'], ['num'], {}, matchCanonical, ALLOWED);

			// Assert
			assert.deepStrictEqual(result, ['keep']);
		});

		it('rejects a criterion outside the supplied vocabulary', () => {
			assert.throws(
				() => arrayFilterEngine([1], ['nan'], {}, dropEqual, ALLOWED),
				/only those allowed at the selected rigor/
			);
		});

	});

	describe('short circuits', () => {

		it('returns the original array untouched for an empty criteria list', () => {
			// Arrange
			const original = [1, 2];

			// Act
			const result = arrayFilterEngine(original, [], {}, dropEqual, undefined);

			// Assert: returns before cloning, so the same reference comes back
			assert.strictEqual(result, original);
			assert.deepStrictEqual(result, [1, 2]);
		});

		it('short circuits before the empty-array check', () => {
			// An empty array with no criteria is returned rather than rejected.
			assert.doesNotThrow(() => arrayFilterEngine([], [], {}, dropEqual, undefined));
		});

	});

	describe('depth', () => {

		it('descends without limit by default', () => {
			assert.deepStrictEqual(
				arrayFilterEngine([[[1, 'keep']]], [1], {}, dropEqual, undefined),
				[[['keep']]]
			);
		});

		it('honours a depth limit', () => {
			assert.deepStrictEqual(
				arrayFilterEngine([[[1, 'keep']]], [1], { depth: 1 }, dropEqual, undefined),
				[[[1, 'keep']]]
			);
		});

	});

});
