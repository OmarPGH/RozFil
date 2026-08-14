/**
 * @file Unit tests for the nested-container inspector.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isWalkable } from '../../src/shared/isWalkable.js';

describe('isWalkable', () => {

	describe('containers', () => {

		it('reports a plain object as descendInObj', () => {
			assert.strictEqual(isWalkable({}), 'descendInObj');
			assert.strictEqual(isWalkable({ a: 1 }), 'descendInObj');
		});

		it('reports an array as descendInArr', () => {
			assert.strictEqual(isWalkable([]), 'descendInArr');
			assert.strictEqual(isWalkable([1, 2]), 'descendInArr');
		});

		it('distinguishes an array from an object', () => {
			// Arrays are typeof 'object', so the order of the checks matters.
			assert.notStrictEqual(isWalkable([]), isWalkable({}));
		});

	});

	describe('non-containers', () => {

		it('returns undefined for null despite typeof null being object', () => {
			assert.strictEqual(isWalkable(null), undefined);
		});

		it('returns undefined for primitives', () => {
			for (const value of [5, 'text', true, undefined, 9n, Symbol('s')]) {
				assert.strictEqual(
					isWalkable(value), undefined,
					`${String(value)} should not be walkable`
				);
			}
		});

		it('returns undefined for a function', () => {
			assert.strictEqual(isWalkable(() => {}), undefined);
		});

	});

	describe('return value doubles as a boolean test', () => {

		it('is truthy for containers and falsy for everything else', () => {
			assert.ok(isWalkable({}));
			assert.ok(isWalkable([]));
			assert.ok(!isWalkable(null));
			assert.ok(!isWalkable(5));
		});

	});

	describe('known behaviour with exotic objects', () => {

		// Detection is structural — anything that is typeof 'object' and not an
		// array or null is reported as a plain object, built-ins included.
		it('treats Date and Map as plain objects', () => {
			assert.strictEqual(isWalkable(new Date()), 'descendInObj');
			assert.strictEqual(isWalkable(new Map()), 'descendInObj');
		});

	});

});
