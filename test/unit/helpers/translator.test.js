import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { translator } from '../../../src/helpers/translator.js';

describe('translator', () => {
	describe('canonical names pass through', () => {
		it('returns "string" for "string"', () => {
			assert.equal(translator('string'), 'string');
		});
		it('returns "number" for "number"', () => {
			assert.equal(translator('number'), 'number');
		});
		it('returns "object" for "object"', () => {
			assert.equal(translator('object'), 'object');
		});
		it('returns "array" for "array"', () => {
			assert.equal(translator('array'), 'array');
		});
	});

	describe('shorthand aliases translate to canonical names', () => {
		const cases = [
			['str', 'string'],
			['num', 'number'],
			['bln', 'boolean'],
			['uf', 'undefined'],
			['fun', 'function'],
			['nl', 'null'],
			['arr', 'array'],
			['obj', 'object'],
			['nan', 'NaN'],
			['bi', 'bigint'],
			['ifty', 'Infinity'],
			['smbl', 'symbol'],
			['tru', 'true'],
			['fls', 'false'],
			['emptystr', 'emptyString'],
			['ss', 'emptyStringWithSpaces'],
			['ss?', 'emptyStringOrWithSpaces'],
			['{s?}', 'emptyObject'],
			['[s?]', 'emptyArray'],
			['date', 'date'],
		];

		for (const [alias, canonical] of cases) {
			it(`translates "${alias}" -> "${canonical}"`, () => {
				assert.equal(translator(alias), canonical);
			});
		}
	});

	it('is case-insensitive', () => {
		assert.equal(translator('STR'), 'string');
		assert.equal(translator('Num'), 'number');
		assert.equal(translator('ARR'), 'array');
	});

	describe('full lowercase-word aliases (distinct branches from the short forms)', () => {
		const fullWordCases = [
			['infinity', 'Infinity'],
			['emptystringwithspaces', 'emptyStringWithSpaces'],
			['emptystringorwithspaces', 'emptyStringOrWithSpaces'],
			['emptyobj', 'emptyObject'],
			['emptyarr', 'emptyArray'],
		];

		for (const [alias, canonical] of fullWordCases) {
			it(`translates "${alias}" -> "${canonical}"`, () => {
				assert.equal(translator(alias), canonical);
			});
		}
	});

	it('trims surrounding whitespace', () => {
		assert.equal(translator('  str  '), 'string');
		assert.equal(translator('\tnum\n'), 'number');
	});

	it('returns "invalid/null" for an unrecognized alias', () => {
		assert.equal(translator('not-a-real-type'), 'invalid/null');
	});

	it('returns "invalid/null" when called with no argument (default param)', () => {
		assert.equal(translator(), 'invalid/null');
	});

	it('treats an empty string input as "emptyString"', () => {
		assert.equal(translator(''), 'emptyString');
	});
});
