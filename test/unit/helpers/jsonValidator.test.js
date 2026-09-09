import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isJsonNum, isJsonArr, isJsonObj, isJsonObjArr } from '../../../src/helpers/jsonValidator.js';

describe('isJsonNum', () => {
	it('returns true for a numeric string', () => {
		assert.equal(isJsonNum('123'), true);
	});

	it('returns true for a negative/decimal numeric string', () => {
		assert.equal(isJsonNum('-3.14'), true);
	});

	it('returns falsy for a NaN-producing string', () => {
		assert.ok(!isJsonNum('not-a-number'));
	});

	it('returns falsy for the literal string "Infinity"', () => {
		// JSON.parse('Infinity') throws, so this hits the catch branch
		assert.ok(!isJsonNum('Infinity'));
	});

	it('returns undefined for a plain object (JSON.parse succeeds but type check fails)', () => {
		assert.equal(isJsonNum('{"a":1}'), undefined);
	});

	it('returns falsy for an unparsable string', () => {
		assert.ok(!isJsonNum('{not valid json'));
	});
});

describe('isJsonArr', () => {
	it('returns true for a stringified array', () => {
		assert.equal(isJsonArr('[1,2,3]'), true);
	});

	it('returns true for a stringified empty array', () => {
		assert.equal(isJsonArr('[]'), true);
	});

	it('returns undefined for a stringified object (not an array)', () => {
		assert.equal(isJsonArr('{"a":1}'), undefined);
	});

	it('returns falsy for garbage input', () => {
		assert.ok(!isJsonArr('not json at all'));
	});
});

describe('isJsonObj', () => {
	it('returns true for a stringified object', () => {
		assert.equal(isJsonObj('{"a":1}'), true);
	});

	it('returns true for a stringified empty object', () => {
		assert.equal(isJsonObj('{}'), true);
	});

	it('returns falsy for a stringified array (not a plain object)', () => {
		assert.ok(!isJsonObj('[1,2,3]'));
	});

	it('returns falsy for a stringified null', () => {
		assert.ok(!isJsonObj('null'));
	});

	it('returns falsy for garbage input', () => {
		assert.ok(!isJsonObj('not json at all'));
	});
});

describe('isJsonObjArr', () => {
	it('returns true for a stringified array', () => {
		assert.equal(isJsonObjArr('[1,2]'), true);
	});

	it('returns true for a stringified object', () => {
		assert.equal(isJsonObjArr('{"a":1}'), true);
	});

	it('returns false for a plain non-JSON string', () => {
		assert.equal(isJsonObjArr('hello world'), false);
	});

	it('returns false for a numeric string', () => {
		assert.equal(isJsonObjArr('123'), false);
	});
});
