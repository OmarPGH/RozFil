import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { objectFilterEngine } from '../../../src/engines/objectFilterEngine.js';
import { arrayFilterEngine } from '../../../src/engines/arrayFilterEngine.js';

// These engines are normally reached only through filterEngineRouter, which already
// guarantees the target is an array (for arrayFilterEngine) or a plain object (for
// objectFilterEngine). Calling them directly here lets us exercise their own internal
// type-validation branch in isolation, independent of the router's guard.

describe('objectFilterEngine - direct calls (isolating its own type validation)', () => {
	const noopFilterFun = () => false;

	it('throws "this isn\'t object" when given an array directly', () => {
		assert.throws(() => objectFilterEngine([1, 2], ['x'], {}, noopFilterFun, undefined), /this isn't object/);
	});

	it('throws "this isn\'t object" when given null directly', () => {
		assert.throws(() => objectFilterEngine(null, ['x'], {}, noopFilterFun, undefined), /this isn't object/);
	});

	it('throws "this isn\'t object" when given a primitive directly', () => {
		assert.throws(() => objectFilterEngine('a string', ['x'], {}, noopFilterFun, undefined), /this isn't object/);
	});

	it('processes a valid plain object without throwing', () => {
		const result = objectFilterEngine({ a: 1 }, [], {}, noopFilterFun, undefined);
		assert.deepEqual(result, { a: 1 });
	});
});

describe('arrayFilterEngine - direct calls (isolating its own type validation)', () => {
	const noopFilterFun = () => false;

	it('throws "this isn\'t array" when given a plain object directly', () => {
		assert.throws(() => arrayFilterEngine({ a: 1 }, ['x'], {}, noopFilterFun, undefined), /this isn't array/);
	});

	it('throws "this isn\'t array" when given a primitive directly', () => {
		assert.throws(() => arrayFilterEngine('a string', ['x'], {}, noopFilterFun, undefined), /this isn't array/);
	});

	it('processes a valid array without throwing', () => {
		const result = arrayFilterEngine([1, 2], [], {}, noopFilterFun, undefined);
		assert.deepEqual(result, [1, 2]);
	});
});
