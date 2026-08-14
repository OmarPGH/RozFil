/**
 * @file Unit tests for the container-type router.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { filterEngineRouter } from '../../src/shared/filterEngineRouter.js';
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

describe('filterEngineRouter', () => {

	describe('dispatch', () => {

		it('routes an array to the array engine', () => {
			// Arrange / Act
			const result = filterEngineRouter([1, 2, 3], [2], {}, dropEqual, undefined);

			// Assert: compaction is the array engine's signature
			assert.deepStrictEqual(result, [1, 3]);
		});

		it('routes a plain object to the object engine', () => {
			const result = filterEngineRouter({ a: 1, b: 2 }, [1], {}, dropEqual, undefined);
			assert.deepStrictEqual(result, { b: 2 });
		});

		it('forwards options through to the chosen engine', () => {
			// Arrange
			const target = [1, 2];

			// Act
			const result = filterEngineRouter(target, [1], { inPlace: true }, dropEqual, undefined);

			// Assert
			assert.strictEqual(result, target, 'inPlace should have reached the engine');
		});

	});

	describe('unsupported containers', () => {

		it('rejects primitives', () => {
			for (const value of ['text', 5, true, undefined, 9n]) {
				assert.throws(
					() => filterEngineRouter(value, [1], {}, dropEqual, undefined),
					/Unsupported type/,
					`${String(value)} should be rejected`
				);
			}
		});

		it('rejects null, which typeof reports as object', () => {
			assert.throws(
				() => filterEngineRouter(null, [1], {}, dropEqual, undefined),
				/Unsupported type/
			);
		});

		it('rejects a function', () => {
			assert.throws(
				() => filterEngineRouter(() => {}, [1], {}, dropEqual, undefined),
				/Unsupported type/
			);
		});

	});

	describe('known behaviour with exotic objects', () => {

		// A Date is typeof 'object' and not an array, so it reaches the object
		// engine — where it fails the non-empty check, since it has no own keys.
		it('routes a Date to the object engine, which then rejects it as empty', () => {
			assert.throws(
				() => filterEngineRouter(new Date(), [1], {}, dropEqual, undefined),
				/Object items is less than 1/
			);
		});

	});

});
