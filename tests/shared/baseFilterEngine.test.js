/**
 * @file Unit tests for the validation helpers, cloning, and the traversal
 * loops both engines are built from.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
	validateDataType,
	validateOptions,
	sanitizeInput,
	validateAndTranslateInput,
	validateDataNotEmpty,
	cloneData,
	deleteObjectKeysNonIterative,
	processObjectFilter,
	processArrayFilter,
} from '../../src/shared/baseFilterEngine.js';

import { isWalkable } from '../../src/shared/isWalkable.js';

/**
 * Minimal predicate for exercising the loops: drops values strictly equal to
 * the criterion, descends into containers, keeps everything else.
 *
 * @type {import('../../src/typedefs.js').FilterPredicate}
 */
const dropEqual = (key, value, currentInput) => {
	const walk = isWalkable(value);
	if (walk) return walk;
	return value === currentInput;
};

describe('validateDataType', () => {

	it('passes a satisfied condition through silently', () => {
		assert.doesNotThrow(() => validateDataType(true, 'array'));
	});

	it('throws naming the expected type', () => {
		assert.throws(() => validateDataType(false, 'array'), /this isn't array/);
		assert.throws(() => validateDataType(false, 'object'), /this isn't object/);
	});

});

describe('validateOptions', () => {

	it('accepts both options omitted', () => {
		assert.doesNotThrow(() => validateOptions(undefined, undefined));
	});

	it('accepts a boolean inPlace and an integer depth', () => {
		assert.doesNotThrow(() => validateOptions(true, 3));
		assert.doesNotThrow(() => validateOptions(false, 0));
	});

	it('accepts Infinity as a depth', () => {
		assert.doesNotThrow(() => validateOptions(undefined, Infinity));
	});

	it('rejects a non-boolean inPlace', () => {
		assert.throws(() => validateOptions('yes', undefined), /In place \(inPlace\) option must be boolean/);
		assert.throws(() => validateOptions(1, undefined), /In place \(inPlace\) option must be boolean/);
	});

	it('rejects a non-integer depth', () => {
		assert.throws(() => validateOptions(undefined, 1.5), /depth option must be integer or infinity/);
		assert.throws(() => validateOptions(undefined, 'deep'), /depth option must be integer or infinity/);
	});

});

describe('sanitizeInput', () => {

	it('de-duplicates an array', () => {
		assert.deepStrictEqual(sanitizeInput([1, 1, 2, 2, 3]), [1, 2, 3]);
	});

	it('preserves first-seen order', () => {
		assert.deepStrictEqual(sanitizeInput(['b', 'a', 'b']), ['b', 'a']);
	});

	it('returns a copy, leaving the caller array untouched', () => {
		// Arrange
		const original = ['num'];

		// Act
		const sanitized = sanitizeInput(original);
		sanitized[0] = 'mutated';

		// Assert
		assert.deepStrictEqual(original, ['num']);
	});

	it('passes a non-array, non-object value straight through', () => {
		assert.strictEqual(sanitizeInput('x'), 'x');
		assert.strictEqual(sanitizeInput(5), 5);
	});

	it('rejects a plain object, which cannot be told apart from a container', () => {
		assert.throws(() => sanitizeInput({}), /input mustn't be an object/);
		assert.throws(() => sanitizeInput({ a: 1 }), /input mustn't be an object/);
	});

});

describe('validateAndTranslateInput', () => {

	it('translates aliases to canonical names', () => {
		assert.deepStrictEqual(validateAndTranslateInput(['num'], ['number']), ['number']);
		assert.deepStrictEqual(
			validateAndTranslateInput(['str', 'nan'], ['string', 'NaN', 'number']),
			['string', 'NaN']
		);
	});

	it('returns input untouched when no vocabulary is supplied', () => {
		// This is the fbVal path — arbitrary values have nothing to validate against.
		assert.deepStrictEqual(validateAndTranslateInput(['anything', 42], undefined), ['anything', 42]);
	});

	it('rejects a name that is not selectable at this rigor', () => {
		assert.throws(
			() => validateAndTranslateInput(['nan'], ['string', 'number']),
			/only those allowed at the selected rigor/
		);
	});

	it('rejects an unknown name', () => {
		assert.throws(
			() => validateAndTranslateInput(['not-a-type'], ['string']),
			/only those allowed at the selected rigor/
		);
	});

	it('rejects more entries than the vocabulary holds', () => {
		assert.throws(() => validateAndTranslateInput(['a', 'b'], ['number']), /Types is more than 1/);
	});

});

describe('validateDataNotEmpty', () => {

	it('accepts any length of at least one', () => {
		assert.doesNotThrow(() => validateDataNotEmpty(1, 'Array length'));
		assert.doesNotThrow(() => validateDataNotEmpty(99, 'Array length'));
	});

	it('throws on an empty container, naming the thing measured', () => {
		assert.throws(() => validateDataNotEmpty(0, 'Array length'), /Array length is less than 1/);
		assert.throws(() => validateDataNotEmpty(0, 'Object items'), /Object items is less than 1/);
	});

});

describe('cloneData', () => {

	it('returns the same reference when inPlace is true', () => {
		// Arrange
		const source = [1, 2];

		// Act
		const result = cloneData(source, true, 'array', '[Symbol]');

		// Assert
		assert.strictEqual(result, source);
	});

	it('returns a deep copy when inPlace is false', () => {
		// Arrange
		const source = [{ nested: 1 }];

		// Act
		const result = cloneData(source, false, 'array', '[Symbol]');

		// Assert
		assert.notStrictEqual(result, source);
		assert.notStrictEqual(result[0], source[0]);
		assert.deepStrictEqual(result, source);
	});

	it('defaults to cloning when inPlace is omitted', () => {
		const source = [1];
		assert.notStrictEqual(cloneData(source, undefined, 'array', '[Symbol]'), source);
	});

	it('throws a guided error on non-cloneable members', () => {
		assert.throws(
			() => cloneData([Symbol('s')], false, 'array', '[Symbol]'),
			/unable to clone your array/
		);
		assert.throws(
			() => cloneData({ fn: () => {} }, false, 'object', '[Symbol, Function, etc]'),
			/unable to clone your object/
		);
	});

	it('does not attempt to clone when filtering in place, so symbols survive', () => {
		const source = [Symbol('s')];
		assert.doesNotThrow(() => cloneData(source, true, 'array', '[Symbol]'));
	});

});

describe('deleteObjectKeysNonIterative', () => {

	it('deletes the named properties', () => {
		assert.deepStrictEqual(deleteObjectKeysNonIterative({ a: 1, b: 2, c: 3 }, ['a', 'c']), { b: 2 });
	});

	it('ignores names that are not present', () => {
		assert.deepStrictEqual(deleteObjectKeysNonIterative({ a: 1 }, ['zzz']), { a: 1 });
	});

	it('mutates and returns the same reference', () => {
		// Arrange
		const target = { a: 1, b: 2 };

		// Act
		const result = deleteObjectKeysNonIterative(target, ['a']);

		// Assert
		assert.strictEqual(result, target);
		assert.deepStrictEqual(target, { b: 2 });
	});

});

describe('processArrayFilter', () => {

	it('applies every criterion in the list', () => {
		assert.deepStrictEqual(
			processArrayFilter([1, 2, 3, 4], [2, 4], Infinity, dropEqual),
			[1, 3]
		);
	});

	it('accepts a single non-array criterion', () => {
		assert.deepStrictEqual(processArrayFilter([1, 2, 3], 2, Infinity, dropEqual), [1, 3]);
	});

	it('preserves the order of survivors', () => {
		assert.deepStrictEqual(
			processArrayFilter(['a', 'x', 'b', 'x', 'c'], ['x'], Infinity, dropEqual),
			['a', 'b', 'c']
		);
	});

	it('truncates length rather than leaving holes', () => {
		// Arrange
		const target = [1, 'keep', 2, 'keep'];

		// Act
		const result = processArrayFilter(target, [1, 2], Infinity, dropEqual);

		// Assert: two-pointer compaction must close the gaps, not blank them
		assert.strictEqual(result.length, 2);
		assert.ok(result.every((_, index) => index in result), 'no holes expected');
		assert.deepStrictEqual(result, ['keep', 'keep']);
	});

	it('mutates and returns the same reference', () => {
		const target = [1, 2];
		assert.strictEqual(processArrayFilter(target, [1], Infinity, dropEqual), target);
	});

	it('recurses into nested arrays up to depth', () => {
		assert.deepStrictEqual(
			processArrayFilter([1, [1, [1]]], [1], Infinity, dropEqual),
			[[[]]]
		);
	});

	it('stops descending once depth is reached', () => {
		assert.deepStrictEqual(
			processArrayFilter([1, [1, [1]]], [1], 1, dropEqual),
			[[1, [1]]]
		);
	});

});

describe('processObjectFilter', () => {

	it('applies every criterion in the list', () => {
		assert.deepStrictEqual(
			processObjectFilter({ a: 1, b: 2, c: 3 }, [1, 3], Infinity, dropEqual),
			{ b: 2 }
		);
	});

	it('accepts a single non-array criterion', () => {
		assert.deepStrictEqual(processObjectFilter({ a: 1, b: 2 }, 1, Infinity, dropEqual), { b: 2 });
	});

	it('mutates and returns the same reference', () => {
		const target = { a: 1, b: 2 };
		assert.strictEqual(processObjectFilter(target, [1], Infinity, dropEqual), target);
	});

	it('recurses into nested objects up to depth', () => {
		assert.deepStrictEqual(
			processObjectFilter({ a: { b: { c: 1 } } }, [1], Infinity, dropEqual),
			{ a: { b: {} } }
		);
	});

	it('stops descending once depth is reached', () => {
		assert.deepStrictEqual(
			processObjectFilter({ a: { b: { c: 1 } } }, [1], 1, dropEqual),
			{ a: { b: { c: 1 } } }
		);
	});

	it('crosses between object and array containers while walking', () => {
		assert.deepStrictEqual(
			processObjectFilter({ list: [1, 'keep'] }, [1], Infinity, dropEqual),
			{ list: ['keep'] }
		);
	});

});
