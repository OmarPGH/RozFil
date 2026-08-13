/**
 * @file Regression tests for reported bugs.
 *
 * Run with `npm test`, or directly with `node --test tests/regressions.test.js`.
 * Uses only the Node.js built-in test runner and assert module — no
 * dependencies, in keeping with the library itself.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { fbVal, fbType } from '../src/index.js';

test('issue #24 — fbVal honours cs: false', async (t) => {

	await t.test('matches regardless of casing when cs is false', () => {
		assert.deepEqual(fbVal(['ADMIN', 'x'], ['admin'], { cs: false }), ['x']);
	});

	await t.test('is case-sensitive by default', () => {
		assert.deepEqual(fbVal(['ADMIN', 'x'], ['admin']), ['ADMIN', 'x']);
	});

	await t.test('is case-sensitive when cs is true', () => {
		assert.deepEqual(fbVal(['ADMIN', 'admin'], ['admin'], { cs: true }), ['ADMIN']);
	});

	await t.test('cs: false reaches nested values', () => {
		assert.deepEqual(
			fbVal({ a: { role: 'Admin' }, b: { role: 'Guest' } }, ['admin'], { cs: false, depth: 2 }),
			{ a: {}, b: { role: 'Guest' } }
		);
	});

	await t.test('rejects a non-boolean cs instead of coercing it', () => {
		assert.throws(() => fbVal(['x'], ['x'], { cs: 0 }), /Case sensitivity/);
	});

});

test('issue #25 — fbVal accepts a non-array input on an object', async (t) => {

	await t.test('object container with a single non-array value', () => {
		assert.deepEqual(fbVal({ a: 'x', b: 'y' }, 'x'), { b: 'y' });
	});

	await t.test('array container with a single non-array value still works', () => {
		assert.deepEqual(fbVal(['x', 'y'], 'x'), ['y']);
	});

	await t.test('object container with an array input still works', () => {
		assert.deepEqual(fbVal({ a: 'x', b: 'y' }, ['x']), { b: 'y' });
	});

});

test('unchanged behaviour', async (t) => {

	await t.test('fbVal compares stringified values', () => {
		assert.deepEqual(fbVal([1, 2, 3, '2'], [2]), [1, 3]);
	});

	await t.test('fbType detects stringified numbers at rigor 3', () => {
		assert.deepEqual(fbType([10, 'hello', '123', null], ['num'], { rigor: 3 }), ['hello', null]);
	});

	await t.test('fbType separates NaN from number at rigor 2', () => {
		assert.deepEqual(fbType([1, NaN, 2], ['nan'], { rigor: 2 }), [1, 2]);
	});

	await t.test('fbType leaves the caller data alone unless inPlace is set', () => {
		const original = [1, 2, 'a'];
		const filtered = fbType(original, ['num'], { rigor: 2 });
		assert.deepEqual(original, [1, 2, 'a']);
		assert.deepEqual(filtered, ['a']);
	});

	await t.test('unsupported containers are rejected', () => {
		assert.throws(() => fbType('not a container', ['num']), /Unsupported type/);
	});

});
