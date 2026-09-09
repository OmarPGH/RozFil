import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fbVal } from '../../src/index.js';

describe('fbVal - basic value exclusion (arrays)', () => {
	it('removes items that strictly match a given value', () => {
		assert.deepEqual(fbVal([1, 2, 3, 2, 1], [2]), [1, 3, 1]);
	});

	it('removes items matching any value in a list of values', () => {
		assert.deepEqual(fbVal(['a', 'b', 'c', 'd'], ['a', 'c']), ['b', 'd']);
	});

	it('accepts a single non-array value (not wrapped in an array)', () => {
		assert.deepEqual(fbVal([1, 2, 3], 2), [1, 3]);
	});

	it('is a strict (===) match by default: does not coerce types', () => {
		assert.deepEqual(fbVal([1, '1', 2], [1]), ['1', 2]);
	});
});

describe('fbVal - case sensitivity (cs option)', () => {
	it('is case-sensitive by default', () => {
		assert.deepEqual(fbVal(['Admin', 'admin', 'Guest'], ['admin']), ['Admin', 'Guest']);
	});

	it('matches case-insensitively when cs: false', () => {
		assert.deepEqual(fbVal(['Admin', 'admin', 'Guest'], ['admin'], { cs: false }), ['Guest']);
	});

	it('coerces non-string values to strings for case-insensitive comparison', () => {
		// cs: false stringifies both sides, so 5 vs '5' matches
		assert.deepEqual(fbVal([5, 10], ['5'], { cs: false }), [10]);
	});

	it('throws when cs is not a boolean', () => {
		assert.throws(() => fbVal([1, 2], [1], { cs: 'yes' }), /Case sensitivity \(cs\) param must be boolean/);
	});
});

describe('fbVal - works on nested objects (depth)', () => {
	const userData = {
		user1: { name: 'Omar', role: 'Admin' },
		user2: { name: 'Yuna', role: 'Guest' },
		user3: { name: 'Harry', role: 'admin' },
	};

	it('removes matching values across nested objects, case-insensitive, with depth 2', () => {
		const result = fbVal(userData, ['admin'], { cs: false, depth: 2 });
		assert.deepEqual(result, {
			user1: { name: 'Omar' },
			user2: { name: 'Yuna', role: 'Guest' },
			user3: { name: 'Harry' },
		});
	});

	it('only touches the top level when depth is 1', () => {
		const result = fbVal(userData, ['admin'], { cs: false, depth: 1 });
		// role values live one level deeper than the top-level user keys,
		// so at depth 1 nothing inside user1/user2/user3 gets removed
		assert.deepEqual(result, userData);
	});
});

describe('fbVal - works on nested arrays (depth)', () => {
	it('recursively removes matching values from nested arrays by default', () => {
		const nested = [1, 2, [2, 3, [2, 4]]];
		assert.deepEqual(fbVal(nested, [2]), [1, [3, [4]]]);
	});

	it('respects a depth limit', () => {
		const nested = [1, 2, [2, 3, [2, 4]]];
		const result = fbVal(nested, [2], { depth: 2 });
		assert.deepEqual(result, [1, [3, [2, 4]]]);
	});
});

describe('fbVal - inPlace option', () => {
	it('does not mutate the original array by default', () => {
		const original = [1, 2, 3];
		const result = fbVal(original, [2]);
		assert.deepEqual(original, [1, 2, 3]);
		assert.deepEqual(result, [1, 3]);
	});

	it('mutates the original array when inPlace: true', () => {
		const original = [1, 2, 3];
		const result = fbVal(original, [2], { inPlace: true });
		assert.equal(result, original);
		assert.deepEqual(original, [1, 3]);
	});
});

describe('fbVal - empty data edge cases', () => {
	it('returns the array unchanged when the values list is empty', () => {
		assert.deepEqual(fbVal([1, 2, 3], []), [1, 2, 3]);
	});

	it('throws when the target array itself is empty', () => {
		assert.throws(() => fbVal([], [1]), /Array length is less than 1/);
	});

	it('throws when the target object itself is empty', () => {
		assert.throws(() => fbVal({}, ['x']), /Object items is less than 1/);
	});
});

describe('fbVal - invalid target type', () => {
	it('throws "Unsupported type" for a non-array, non-object target', () => {
		assert.throws(() => fbVal('just a string', ['x']), /Unsupported type/);
	});
});

describe('fbVal - duplicate values are de-duplicated before filtering', () => {
	it('treats repeated values in the values list as a single value', () => {
		assert.deepEqual(fbVal([1, 2, 3], [2, 2, 2]), [1, 3]);
	});
});
