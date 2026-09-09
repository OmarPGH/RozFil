import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterEngineRouter } from '../../../src/helpers/filterEngineRouter.js';

describe('filterEngineRouter', () => {
	const noopFilterFun = () => false;

	it('routes an array target to arrayFilterEngine (array is processed, not rejected)', () => {
		const result = filterEngineRouter([1, 2, 3], ['x'], {}, noopFilterFun, undefined);
		assert.deepEqual(result, [1, 2, 3]);
	});

	it('routes a plain object target to objectFilterEngine (object is processed, not rejected)', () => {
		const result = filterEngineRouter({ a: 1 }, ['x'], {}, noopFilterFun, undefined);
		assert.deepEqual(result, { a: 1 });
	});

	it('throws "Unsupported type" for a string target', () => {
		assert.throws(() => filterEngineRouter('a string', ['x'], {}, noopFilterFun, undefined), /Unsupported type/);
	});

	it('throws "Unsupported type" for a number target', () => {
		assert.throws(() => filterEngineRouter(42, ['x'], {}, noopFilterFun, undefined), /Unsupported type/);
	});

	it('throws "Unsupported type" for null (typeof null is "object" but explicitly excluded)', () => {
		assert.throws(() => filterEngineRouter(null, ['x'], {}, noopFilterFun, undefined), /Unsupported type/);
	});

	it('throws "Unsupported type" for undefined', () => {
		assert.throws(() => filterEngineRouter(undefined, ['x'], {}, noopFilterFun, undefined), /Unsupported type/);
	});

	it('throws "Unsupported type" for a boolean', () => {
		assert.throws(() => filterEngineRouter(true, ['x'], {}, noopFilterFun, undefined), /Unsupported type/);
	});
});
