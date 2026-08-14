/**
 * @file Unit tests for the object execution engine.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { objectFilterEngine } from '../../src/engines/objectFilterEngine.js';
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

describe('objectFilterEngine', () => {

	describe('filtering', () => {

		it('deletes matching properties', () => {
			assert.deepStrictEqual(
				objectFilterEngine({ a: 1, b: 'keep', c: 2 }, [1, 2], {}, dropEqual, undefined),
				{ b: 'keep' }
			);
		});

		it('de-duplicates the criteria before applying them', () => {
			assert.deepStrictEqual(
				objectFilterEngine({ a: 1, b: 'keep' }, [1, 1, 1], {}, dropEqual, undefined),
				{ b: 'keep' }
			);
		});

		it('walks nested containers, including arrays', () => {
			assert.deepStrictEqual(
				objectFilterEngine({ a: { b: 1, c: 'keep' }, list: [1, 'keep'] }, [1], {}, dropEqual, undefined),
				{ a: { c: 'keep' }, list: ['keep'] }
			);
		});

		it('never removes the containers themselves, only their leaves', () => {
			assert.deepStrictEqual(
				objectFilterEngine({ a: { b: 1 } }, [1], {}, dropEqual, undefined),
				{ a: {} }
			);
		});

	});

	describe('cloning', () => {

		it('leaves the caller object untouched by default', () => {
			// Arrange
			const original = { a: 1, b: 'keep' };

			// Act
			const result = objectFilterEngine(original, [1], {}, dropEqual, undefined);

			// Assert
			assert.deepStrictEqual(original, { a: 1, b: 'keep' });
			assert.deepStrictEqual(result, { b: 'keep' });
			assert.notStrictEqual(result, original);
		});

		it('deep clones, so nested edits do not reach the caller', () => {
			// Arrange
			const original = { outer: { inner: 1, keep: 'x' } };

			// Act
			objectFilterEngine(original, [1], {}, dropEqual, undefined);

			// Assert
			assert.deepStrictEqual(original, { outer: { inner: 1, keep: 'x' } });
		});

		it('mutates the caller object when inPlace is true', () => {
			// Arrange
			const original = { a: 1, b: 'keep' };

			// Act
			const result = objectFilterEngine(original, [1], { inPlace: true }, dropEqual, undefined);

			// Assert
			assert.strictEqual(result, original);
			assert.deepStrictEqual(original, { b: 'keep' });
		});

		it('surfaces a guided error on non-cloneable members', () => {
			assert.throws(
				() => objectFilterEngine({ fn: () => {}, a: 1 }, [1], {}, dropEqual, undefined),
				/unable to clone your object/
			);
		});

	});

	describe('validation', () => {

		it('rejects an array, which has its own engine', () => {
			assert.throws(() => objectFilterEngine([1], [1], {}, dropEqual, undefined), /this isn't object/);
		});

		it('rejects null', () => {
			assert.throws(() => objectFilterEngine(null, [1], {}, dropEqual, undefined), /this isn't object/);
		});

		it('rejects an object with no own keys', () => {
			assert.throws(() => objectFilterEngine({}, [1], {}, dropEqual, undefined), /Object items is less than 1/);
		});

		it('rejects malformed options before doing any work', () => {
			assert.throws(
				() => objectFilterEngine({ a: 1 }, [1], { inPlace: 'yes' }, dropEqual, undefined),
				/In place \(inPlace\) option must be boolean/
			);
		});

		it('rejects a criterion outside the supplied vocabulary', () => {
			assert.throws(
				() => objectFilterEngine({ a: 1 }, ['nan'], {}, dropEqual, ALLOWED),
				/only those allowed at the selected rigor/
			);
		});

	});

	describe('short circuits', () => {

		it('returns the original object untouched for an empty criteria list', () => {
			// Arrange
			const original = { a: 1 };

			// Act
			const result = objectFilterEngine(original, [], {}, dropEqual, undefined);

			// Assert: returns before cloning, so the same reference comes back
			assert.strictEqual(result, original);
		});

	});

	describe('non-iterative mode', () => {

		it('deletes by property name when iterate is false', () => {
			// Arrange / Act: values are never inspected in this mode
			const result = objectFilterEngine(
				{ a: 1, b: 2, c: 3 }, ['a', 'c'], {}, dropEqual, undefined, false
			);

			// Assert
			assert.deepStrictEqual(result, { b: 2 });
		});

		it('ignores names that are not present', () => {
			assert.deepStrictEqual(
				objectFilterEngine({ a: 1 }, ['zzz'], {}, dropEqual, undefined, false),
				{ a: 1 }
			);
		});

		it('still respects inPlace', () => {
			// Arrange
			const original = { a: 1, b: 2 };

			// Act
			const result = objectFilterEngine(original, ['a'], { inPlace: true }, dropEqual, undefined, false);

			// Assert
			assert.strictEqual(result, original);
			assert.deepStrictEqual(original, { b: 2 });
		});

	});

	describe('depth', () => {

		it('descends without limit by default', () => {
			assert.deepStrictEqual(
				objectFilterEngine({ a: { b: { c: 1, d: 'keep' } } }, [1], {}, dropEqual, undefined),
				{ a: { b: { d: 'keep' } } }
			);
		});

		it('honours a depth limit', () => {
			assert.deepStrictEqual(
				objectFilterEngine({ a: { b: { c: 1 } } }, [1], { depth: 1 }, dropEqual, undefined),
				{ a: { b: { c: 1 } } }
			);
		});

	});

});
