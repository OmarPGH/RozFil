import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isWalkable } from '../../../src/helpers/isWalkable.js';

describe('isWalkable', () => {
	it('returns "descendInObj" for a plain object', () => {
		assert.equal(isWalkable({ a: 1 }), 'descendInObj');
	});

	it('returns "descendInObj" for an empty object', () => {
		assert.equal(isWalkable({}), 'descendInObj');
	});

	it('returns "descendInArr" for an array', () => {
		assert.equal(isWalkable([1, 2, 3]), 'descendInArr');
	});

	it('returns "descendInArr" for an empty array', () => {
		assert.equal(isWalkable([]), 'descendInArr');
	});

	it('returns undefined for null (not walkable)', () => {
		assert.equal(isWalkable(null), undefined);
	});

	it('returns undefined for a string', () => {
		assert.equal(isWalkable('hello'), undefined);
	});

	it('returns undefined for a number', () => {
		assert.equal(isWalkable(42), undefined);
	});

	it('returns undefined for a boolean', () => {
		assert.equal(isWalkable(true), undefined);
	});

	it('returns undefined for undefined', () => {
		assert.equal(isWalkable(undefined), undefined);
	});

	it('returns undefined for a function', () => {
		assert.equal(isWalkable(() => {}), undefined);
	});

	it('returns undefined for NaN', () => {
		assert.equal(isWalkable(NaN), undefined);
	});
});
