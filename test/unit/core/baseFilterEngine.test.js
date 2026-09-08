import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	validateDataType,
	validateOptions,
	sanitizeInput,
	validateAndTranslateInput,
	validateDataNotEmpty,
	cloneData,
	processObjectFilter,
	processArrayFilter,
} from '../../../src/core/baseFilterEngine.js';

describe('validateDataType', () => {
	it('does not throw when condition is true', () => {
		assert.doesNotThrow(() => validateDataType(true, 'array'));
	});

	it('throws a descriptive error when condition is false', () => {
		assert.throws(() => validateDataType(false, 'array'), /this isn't array/);
	});
});

describe('validateOptions', () => {
	it('does not throw for valid inPlace boolean + integer depth', () => {
		assert.doesNotThrow(() => validateOptions(true, 3));
		assert.doesNotThrow(() => validateOptions(false, 0));
	});

	it('does not throw when inPlace and depth are undefined (defaults)', () => {
		assert.doesNotThrow(() => validateOptions(undefined, undefined));
	});

	it('does not throw when depth is Infinity', () => {
		assert.doesNotThrow(() => validateOptions(true, Infinity));
	});

	it('throws when inPlace is not a boolean', () => {
		assert.throws(() => validateOptions('yes', 3), /In place \(inPlace\) option must be boolean/);
	});

	it('throws when depth is not an integer and not Infinity', () => {
		assert.throws(() => validateOptions(true, 1.5), /depth option must be integer or infinity/);
		assert.throws(() => validateOptions(true, 'deep'), /depth option must be integer or infinity/);
	});
});

describe('sanitizeInput', () => {
	it('de-duplicates an array input using Set semantics', () => {
		assert.deepEqual(sanitizeInput(['a', 'b', 'a', 'c', 'b']), ['a', 'b', 'c']);
	});

	it('wraps a non-array, non-object primitive into a single-item array', () => {
		assert.deepEqual(sanitizeInput('string'), ['string']);
		assert.deepEqual(sanitizeInput(42), [42]);
	});

	it('wraps undefined into a single-item array', () => {
		assert.deepEqual(sanitizeInput(undefined), [undefined]);
	});

	it('throws when input is a plain object', () => {
		assert.throws(() => sanitizeInput({ a: 1 }), /Invalid input: input mustn't be an object/);
	});

	it('does not throw for null (typeof null === "object" but explicitly excluded)', () => {
		// null is typeof 'object', but the guard `input !== null` skips the throw branch,
		// so it falls through to being wrapped as [null]
		assert.deepEqual(sanitizeInput(null), [null]);
	});
});

describe('validateAndTranslateInput', () => {
	const allowed = ['string', 'number', 'boolean'];

	it('returns input unchanged when allowed is undefined', () => {
		assert.deepEqual(validateAndTranslateInput(['whatever'], undefined), ['whatever']);
	});

	it('translates shorthand aliases and validates against the allowed list', () => {
		assert.deepEqual(validateAndTranslateInput(['str', 'num'], allowed), ['string', 'number']);
	});

	it('throws when the translated type is not in the allowed list', () => {
		assert.throws(
			() => validateAndTranslateInput(['array'], allowed),
			/Type Error, only those allowed at the selected rigor/
		);
	});

	it('throws when input length exceeds the allowed list length', () => {
		assert.throws(
			() => validateAndTranslateInput(['str', 'num', 'bln', 'extra'], allowed),
			/Types is more than 3/
		);
	});

	it('throws when a value cannot be translated at all (invalid alias)', () => {
		assert.throws(
			() => validateAndTranslateInput(['not-a-type'], allowed),
			/Type Error, only those allowed at the selected rigor/
		);
	});
});

describe('validateDataNotEmpty', () => {
	it('does not throw when length is 1 or more', () => {
		assert.doesNotThrow(() => validateDataNotEmpty(1, 'Array length'));
		assert.doesNotThrow(() => validateDataNotEmpty(5, 'Object items'));
	});

	it('throws when length is 0', () => {
		assert.throws(() => validateDataNotEmpty(0, 'Array length'), /Array length is less than 1/);
	});
});

describe('cloneData', () => {
	it('returns the same reference when inPlace is true', () => {
		const original = { a: 1 };
		const result = cloneData(original, true, 'object', '[Symbol]');
		assert.equal(result, original);
	});

	it('returns a deep clone (different reference, equal value) when inPlace is false', () => {
		const original = { a: { b: 1 } };
		const result = cloneData(original, false, 'object', '[Symbol]');
		assert.notEqual(result, original);
		assert.notEqual(result.a, original.a);
		assert.deepEqual(result, original);
	});

	it('defaults to cloning when inPlace is not provided', () => {
		const original = [1, 2, 3];
		const result = cloneData(original, undefined, 'array', '[Symbol]');
		assert.notEqual(result, original);
		assert.deepEqual(result, original);
	});

	it('throws a helpful error when the data cannot be structurally cloned', () => {
		const uncloneable = { fn: () => {} };
		assert.throws(() => cloneData(uncloneable, false, 'object', '[Function]'), /unable to clone your object/);
	});
});

describe('processArrayFilter / processObjectFilter (integration of looping + filterFun)', () => {
	// filterFun mimics the contract used by filterByType/filterByValue:
	// returns true (remove), false (keep), 'descendInArr'/'descendInObj' (walk deeper)
	function removeStrings(key, value) {
		if (typeof value === 'string') return true;
		if (Array.isArray(value)) return 'descendInArr';
		if (typeof value === 'object' && value !== null) return 'descendInObj';
		return false;
	}

	it('removes matching items from a flat array', () => {
		const arr = [1, 'a', 2, 'b', 3];
		const result = processArrayFilter(arr, ['string'], Infinity, removeStrings);
		assert.deepEqual(result, [1, 2, 3]);
	});

	it('respects depth limits when descending into nested arrays', () => {
		const arr = [1, ['a', 2, ['b', 3]]];
		// depth 1: only top level processed, nested array untouched
		const shallow = processArrayFilter(structuredClone(arr), ['string'], 1, removeStrings);
		assert.deepEqual(shallow, [1, ['a', 2, ['b', 3]]]);

		// depth Infinity: fully recursive cleanup
		const deep = processArrayFilter(structuredClone(arr), ['string'], Infinity, removeStrings);
		assert.deepEqual(deep, [1, [2, [3]]]);
	});

	it('removes matching keys from a flat object', () => {
		const obj = { a: 1, b: 'x', c: 2, d: 'y' };
		const result = processObjectFilter(obj, ['string'], Infinity, removeStrings);
		assert.deepEqual(result, { a: 1, c: 2 });
	});

	it('respects depth limits when descending into nested objects', () => {
		const obj = { a: 1, nested: { b: 'x', c: 2 } };
		const shallow = processObjectFilter(structuredClone(obj), ['string'], 1, removeStrings);
		assert.deepEqual(shallow, { a: 1, nested: { b: 'x', c: 2 } });

		const deep = processObjectFilter(structuredClone(obj), ['string'], Infinity, removeStrings);
		assert.deepEqual(deep, { a: 1, nested: { c: 2 } });
	});

	it('processes multiple input types in a single pass', () => {
		function removeStringsAndBooleans(key, value) {
			if (typeof value === 'string' || typeof value === 'boolean') return true;
			return false;
		}
		const arr = [1, 'a', true, 2, false];
		const result = processArrayFilter(arr, ['string', 'boolean'], Infinity, removeStringsAndBooleans);
		assert.deepEqual(result, [1, 2]);
	});

	it('descends from an object into a nested array (loopingOnObject -> loopingOnArray)', () => {
		const obj = { list: ['a', 1, 'b', 2] };
		const result = processObjectFilter(obj, ['string'], Infinity, removeStrings);
		assert.deepEqual(result, { list: [1, 2] });
	});

	it('descends from an array into a nested object (loopingOnArray -> loopingOnObject)', () => {
		const arr = [{ a: 'x', b: 1 }, 2, 'c'];
		const result = processArrayFilter(arr, ['string'], Infinity, removeStrings);
		assert.deepEqual(result, [{ b: 1 }, 2]);
	});

	it('handles deep alternating nesting: object -> array -> object -> array', () => {
		const obj = {
			level1: [
				{ level3: ['a', 1, 'b'], keep: 2 },
				'remove-me',
			],
		};
		const result = processObjectFilter(obj, ['string'], Infinity, removeStrings);
		assert.deepEqual(result, {
			level1: [
				{ level3: [1], keep: 2 },
			],
		});
	});
});
