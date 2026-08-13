/**
 * Safe JSON Object/Array Validator
 * 
 * Replaces the vulnerable ReDoS regex with a robust JSON.parse()-based validator.
 * This ensures 100% parsing accuracy without performance hits or security issues.
 */

/**
 * Validates if a string is a valid JSON Object or Array
 * @param {string} value - The string to validate
 * @returns {boolean} True if the string is a valid JSON Object or Array, false otherwise
 * 
 * @description
 * - Returns true ONLY for valid JSON objects and arrays
 * - Returns false for primitives (numbers, booleans, strings, null)
 * - Returns false for malformed/invalid JSON strings
 * - Prevents ReDoS attacks by using native JSON.parse() instead of regex
 */
export function isValidJSONObjectOrArray(value) {
	// Only process strings
	if (typeof value !== 'string') {
		return false;
	}

	try {
		const parsed = JSON.parse(value);
		
		// Explicitly check for object type (not null) or array
		// JSON.parse("123") returns 123, JSON.parse("true") returns true
		// We want to reject these primitive values
		if (typeof parsed === 'object' && parsed !== null) {
			return true;
		}
		
		return false;
	} catch (e) {
		// JSON.parse() threw an error, so it's not valid JSON
		return false;
	}
}

/**
 * Returns true if the value is NOT a valid JSON Object or Array
 * This is useful for the rigorThree() function's string validation logic
 * @param {string} value - The string to validate
 * @returns {boolean} True if the string is NOT a valid JSON Object/Array, false otherwise
 */
export function isNotValidJSONObjectOrArray(value) {
	return !isValidJSONObjectOrArray(value);
}
