/**
 * @file Unit tests for the type alias translator.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { translator } from '../../src/shared/translator.js';
import { invalid } from '../../src/shared/invalid.js';

/** Every accepted spelling, paired with the canonical name it resolves to. */
const ALIASES = [
	['str', 'string'], ['string', 'string'],
	['num', 'number'], ['number', 'number'],
	['bln', 'boolean'], ['boolean', 'boolean'],
	['uf', 'undefined'], ['undefined', 'undefined'],
	['fun', 'function'], ['function', 'function'],
	['nl', 'null'], ['null', 'null'],
	['arr', 'array'], ['array', 'array'],
	['obj', 'object'], ['object', 'object'],
	['nan', 'NaN'],
	['bi', 'bigint'], ['bigint', 'bigint'],
	['ifty', 'Infinity'], ['infinity', 'Infinity'],
	['smbl', 'symbol'], ['symbol', 'symbol'],
	['tru', 'true'], ['true', 'true'],
	['fls', 'false'], ['false', 'false'],
	['', 'emptyString'], ['emptystr', 'emptyString'], ['emptystring', 'emptyString'],
	['ss', 'emptyStringWithSpaces'], ['emptystringwithspaces', 'emptyStringWithSpaces'],
	['ss?', 'emptyStringOrWithSpaces'], ['emptystringorwithspaces', 'emptyStringOrWithSpaces'],
	['{s?}', 'emptyObject'], ['emptyobj', 'emptyObject'], ['emptyobject', 'emptyObject'],
	['[s?]', 'emptyArray'], ['emptyarr', 'emptyArray'], ['emptyarray', 'emptyArray'],
	['date', 'date'],
];

describe('translator', () => {

	describe('alias table', () => {

		for (const [alias, canonical] of ALIASES) {
			it(`resolves ${JSON.stringify(alias)} to ${JSON.stringify(canonical)}`, () => {
				// Arrange / Act
				const result = translator(alias);

				// Assert
				assert.strictEqual(result, canonical);
			});
		}

	});

	describe('normalization', () => {

		it('is case-insensitive', () => {
			assert.strictEqual(translator('STR'), 'string');
			assert.strictEqual(translator('Num'), 'number');
			assert.strictEqual(translator('NAN'), 'NaN');
			assert.strictEqual(translator('INFINITY'), 'Infinity');
		});

		it('trims surrounding whitespace', () => {
			assert.strictEqual(translator('  num  '), 'number');
			assert.strictEqual(translator('\tarr\n'), 'array');
		});

		it('is idempotent — canonical names pass through unchanged', () => {
			// Arrange: every canonical name the table can produce
			const canonicals = [...new Set(ALIASES.map(([, canonical]) => canonical))];

			// Act / Assert
			for (const canonical of canonicals) {
				assert.strictEqual(
					translator(canonical), canonical,
					`translator(${JSON.stringify(canonical)}) should be stable`
				);
			}
		});

	});

	describe('unresolvable input', () => {

		it('returns the invalid marker for an unknown name', () => {
			assert.strictEqual(translator('definitely-not-a-type'), invalid);
			assert.strictEqual(translator('zzz'), invalid);
		});

		it('returns the invalid marker when called with no argument', () => {
			assert.strictEqual(translator(), invalid);
		});

		it('the invalid marker cannot collide with a real type name', () => {
			// Arrange
			const canonicals = ALIASES.map(([, canonical]) => canonical);

			// Assert
			assert.ok(!canonicals.includes(invalid));
		});

		it('throws on a non-string, which has no toLowerCase', () => {
			assert.throws(() => translator(5), TypeError);
			assert.throws(() => translator(null), TypeError);
			assert.throws(() => translator({}), TypeError);
		});

	});

});
