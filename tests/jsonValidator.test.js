import { isValidJSONObjectOrArray, isNotValidJSONObjectOrArray } from '../src/shared/jsonValidator.js';

describe('jsonValidator', () => {

	describe('isValidJSONObjectOrArray()', () => {

		// Valid JSON Objects
		it('should return true for valid JSON objects', () => {
			expect(isValidJSONObjectOrArray('{}')).toBe(true);
			expect(isValidJSONObjectOrArray('{"key": "value"}')).toBe(true);
			expect(isValidJSONObjectOrArray('{"a":1,"b":2}')).toBe(true);
			expect(isValidJSONObjectOrArray('{"nested":{"deep":"value"}}')).toBe(true);
		});

		// Valid JSON Arrays
		it('should return true for valid JSON arrays', () => {
			expect(isValidJSONObjectOrArray('[]')).toBe(true);
			expect(isValidJSONObjectOrArray('[1,2,3]')).toBe(true);
			expect(isValidJSONObjectOrArray('["a","b","c"]')).toBe(true);
			expect(isValidJSONObjectOrArray('[{"id":1},{"id":2}]')).toBe(true);
		});

		// Primitives that JSON.parse() accepts but should fail
		it('should return false for JSON primitives (numbers, booleans, null)', () => {
			expect(isValidJSONObjectOrArray('123')).toBe(false);
			expect(isValidJSONObjectOrArray('true')).toBe(false);
			expect(isValidJSONObjectOrArray('false')).toBe(false);
			expect(isValidJSONObjectOrArray('null')).toBe(false);
			expect(isValidJSONObjectOrArray('"string"')).toBe(false);
			expect(isValidJSONObjectOrArray('3.14')).toBe(false);
		});

		// Invalid JSON
		it('should return false for invalid JSON', () => {
			expect(isValidJSONObjectOrArray('{invalid}')).toBe(false);
			expect(isValidJSONObjectOrArray('[1,2,')).toBe(false);
			expect(isValidJSONObjectOrArray('{ "unclosed": "string }')).toBe(false);
			expect(isValidJSONObjectOrArray('{a:1}')).toBe(false); // keys must be quoted
			expect(isValidJSONObjectOrArray("{'single': 'quotes'}")).toBe(false);
		});

		// Edge cases
		it('should return false for non-string inputs', () => {
			expect(isValidJSONObjectOrArray(123)).toBe(false);
			expect(isValidJSONObjectOrArray(true)).toBe(false);
			expect(isValidJSONObjectOrArray(null)).toBe(false);
			expect(isValidJSONObjectOrArray(undefined)).toBe(false);
			expect(isValidJSONObjectOrArray({ key: 'value' })).toBe(false);
			expect(isValidJSONObjectOrArray([1, 2, 3])).toBe(false);
		});

		// ReDoS attack patterns (these should NOT hang)
		it('should handle ReDoS attack patterns without hanging', () => {
			// Polynomial ReDoS pattern from the original regex
			const redosPattern = '{' + ' '.repeat(50000);
			expect(() => {
				isValidJSONObjectOrArray(redosPattern);
			}).not.toThrow();
			expect(isValidJSONObjectOrArray(redosPattern)).toBe(false);

			// Another variant
			const redosPattern2 = '[{' + ' '.repeat(50000);
			expect(() => {
				isValidJSONObjectOrArray(redosPattern2);
			}).not.toThrow();
			expect(isValidJSONObjectOrArray(redosPattern2)).toBe(false);
		});

		// Whitespace handling
		it('should handle JSON with extra whitespace', () => {
			expect(isValidJSONObjectOrArray('{ }')).toBe(true);
			expect(isValidJSONObjectOrArray('[ ]')).toBe(true);
			expect(isValidJSONObjectOrArray('{ "key" : "value" }')).toBe(true);
			expect(isValidJSONObjectOrArray('[ 1 , 2 , 3 ]')).toBe(true);
		});

	});

	describe('isNotValidJSONObjectOrArray()', () => {

		it('should return the opposite of isValidJSONObjectOrArray()', () => {
			expect(isNotValidJSONObjectOrArray('{}')).toBe(false);
			expect(isNotValidJSONObjectOrArray('[]')).toBe(false);
			expect(isNotValidJSONObjectOrArray('123')).toBe(true);
			expect(isNotValidJSONObjectOrArray('true')).toBe(true);
			expect(isNotValidJSONObjectOrArray('invalid')).toBe(true);
		});

	});

});
