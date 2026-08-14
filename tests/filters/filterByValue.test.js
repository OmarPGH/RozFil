/**
 * @file Unit tests for fbVal — value-based exclusion.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { fbVal } from '../../src/index.js';

describe('fbVal', () => {

	describe('matching', () => {

		it('removes exact matches from an array', () => {
			assert.deepStrictEqual(fbVal(['a', 'b', 'c'], ['b']), ['a', 'c']);
		});

		it('removes matching property values from an object', () => {
			assert.deepStrictEqual(fbVal({ a: 'x', b: 'keep' }, ['x']), { b: 'keep' });
		});

		it('removes several values in one call', () => {
			assert.deepStrictEqual(fbVal([1, 2, 3, 4], [2, 4]), [1, 3]);
		});

		it('collapses duplicate criteria', () => {
			assert.deepStrictEqual(fbVal([1, 2], [1, 1, 1]), [2]);
		});

		it('compares stringified, so 1 and "1" are the same value', () => {
			assert.deepStrictEqual(fbVal([1, '1', 2], [1]), [2]);
			assert.deepStrictEqual(fbVal([1, '1', 2], ['1']), [2]);
		});

		it('matches booleans and null through their string form', () => {
			assert.deepStrictEqual(fbVal([true, 'true', 'keep'], [true]), ['keep']);
			assert.deepStrictEqual(fbVal([null, 'null', 'keep'], [null]), ['keep']);
		});

		it('accepts a single value instead of an array', () => {
			assert.deepStrictEqual(fbVal(['a', 'b'], 'a'), ['b']);
			assert.deepStrictEqual(fbVal({ a: 'x', b: 'y' }, 'x'), { b: 'y' });
		});

		it('removes null values when given a bare null — issue #32', () => {
			// Wrapping turns this into [null], which matches null through the
			// stringified comparison, rather than throwing on the length check.
			assert.deepStrictEqual(fbVal([null, 'keep'], null), ['keep']);
			assert.deepStrictEqual(fbVal({ a: null, b: 'keep' }, null), { b: 'keep' });
		});

		it('treats a bare value identically to a single-element array', () => {
			assert.deepStrictEqual(fbVal([1, 2, 3], 2), fbVal([1, 2, 3], [2]));
			assert.deepStrictEqual(fbVal(['a', 'b'], 'a'), fbVal(['a', 'b'], ['a']));
		});

		it('returns the container untouched for an empty criteria list', () => {
			// Arrange
			const original = ['a', 'b'];

			// Act
			const result = fbVal(original, []);

			// Assert
			assert.strictEqual(result, original);
		});

	});

	describe('case sensitivity', () => {

		it('is case-sensitive by default', () => {
			assert.deepStrictEqual(fbVal(['ADMIN', 'admin'], ['admin']), ['ADMIN']);
		});

		it('is case-sensitive when cs is true', () => {
			assert.deepStrictEqual(fbVal(['ADMIN', 'admin'], ['admin'], { cs: true }), ['ADMIN']);
		});

		it('ignores casing when cs is false', () => {
			assert.deepStrictEqual(fbVal(['ADMIN', 'admin', 'keep'], ['admin'], { cs: false }), ['keep']);
		});

		it('applies case-insensitivity to nested values', () => {
			assert.deepStrictEqual(
				fbVal({ a: { role: 'Admin' }, b: { role: 'Guest' } }, ['admin'], { cs: false }),
				{ a: {}, b: { role: 'Guest' } }
			);
		});

		it('rejects a non-boolean cs', () => {
			assert.throws(() => fbVal(['x'], ['x'], { cs: 'yes' }), /Case sensitivity \(cs\) param must be boolean/);
			assert.throws(() => fbVal(['x'], ['x'], { cs: 0 }), /Case sensitivity \(cs\) param must be boolean/);
		});

	});

	describe('containers and traversal', () => {

		it('walks into nested arrays instead of removing them', () => {
			assert.deepStrictEqual(fbVal(['x', ['x', 'keep']], ['x']), [['keep']]);
		});

		it('walks into nested objects', () => {
			assert.deepStrictEqual(
				fbVal({ a: 'x', b: { c: 'x', d: 'keep' } }, ['x']),
				{ b: { d: 'keep' } }
			);
		});

		it('crosses between object and array containers', () => {
			assert.deepStrictEqual(
				fbVal({ list: ['x', 'keep'] }, ['x']),
				{ list: ['keep'] }
			);
		});

		it('never removes a container itself, only the leaves inside it', () => {
			assert.deepStrictEqual(fbVal({ a: { b: 'x' } }, ['x']), { a: {} });
		});

		it('stops at the depth limit', () => {
			assert.deepStrictEqual(fbVal({ a: { b: { c: 'x' } } }, ['x'], { depth: 1 }), { a: { b: { c: 'x' } } });
			assert.deepStrictEqual(fbVal({ a: { b: { c: 'x' } } }, ['x'], { depth: 3 }), { a: { b: {} } });
		});

		it('descends without limit by default', () => {
			assert.deepStrictEqual(fbVal({ a: { b: { c: 'x', d: 'keep' } } }, ['x']), { a: { b: { d: 'keep' } } });
		});

	});

	describe('options', () => {

		it('clones by default, leaving the caller data untouched', () => {
			// Arrange
			const original = ['a', 'b'];

			// Act
			const result = fbVal(original, ['a']);

			// Assert
			assert.deepStrictEqual(original, ['a', 'b']);
			assert.deepStrictEqual(result, ['b']);
			assert.notStrictEqual(result, original);
		});

		it('mutates in place when asked', () => {
			// Arrange
			const original = ['a', 'b'];

			// Act
			const result = fbVal(original, ['a'], { inPlace: true });

			// Assert
			assert.strictEqual(result, original);
			assert.deepStrictEqual(original, ['b']);
		});

		it('mutates nested structures in place too', () => {
			// Arrange
			const original = { a: { b: 'x', c: 'keep' } };

			// Act
			fbVal(original, ['x'], { inPlace: true });

			// Assert
			assert.deepStrictEqual(original, { a: { c: 'keep' } });
		});

		it('leaves nested structures alone when cloning', () => {
			// Arrange
			const original = { a: { b: 'x', c: 'keep' } };

			// Act
			fbVal(original, ['x']);

			// Assert
			assert.deepStrictEqual(original, { a: { b: 'x', c: 'keep' } });
		});

	});

	describe('compaction', () => {

		it('preserves the order of survivors', () => {
			assert.deepStrictEqual(fbVal(['a', 'x', 'b', 'x', 'c'], ['x']), ['a', 'b', 'c']);
		});

		it('truncates length rather than leaving holes', () => {
			// Arrange / Act
			const result = fbVal(['x', 'keep', 'x', 'keep'], ['x']);

			// Assert
			assert.strictEqual(result.length, 2);
			assert.ok(result.every((_, index) => index in result), 'no holes expected');
		});

	});

	describe('errors', () => {

		it('rejects an unsupported container', () => {
			for (const value of ['text', 5, null, true]) {
				assert.throws(() => fbVal(value, ['x']), /Unsupported type/, `${String(value)} should be rejected`);
			}
		});

		it('rejects an empty container', () => {
			assert.throws(() => fbVal([], ['x']), /Array length is less than 1/);
			assert.throws(() => fbVal({}, ['x']), /Object items is less than 1/);
		});

		it('rejects a plain object as the criteria', () => {
			assert.throws(() => fbVal(['x'], { a: 1 }), /input mustn't be an object/);
		});

		it('rejects malformed options', () => {
			assert.throws(() => fbVal(['x'], ['x'], { inPlace: 'yes' }), /In place \(inPlace\) option must be boolean/);
			assert.throws(() => fbVal(['x'], ['x'], { depth: 1.5 }), /depth option must be integer or infinity/);
		});

		it('needs inPlace for containers holding non-cloneable members', () => {
			assert.throws(() => fbVal([Symbol('s'), 'x'], ['x']), /unable to clone your array/);
		});

	});

});
