import { filterEngineRouter, isWalkable } from '../shared/index.js';


/**
 * Filters an array or object by excluding values that match the given input.
 *
 * @param {Array | Object} ele - The array or object to filter.
 * @param {Array | any} input - The value or values to exclude.
 * @param {Object} [options={}] - Filtering options.
 * @param {boolean} [options.cs=true] - Whether string comparisons are case-sensitive.
 * @param {boolean} [options.inPlace] - Whether to mutate the original data.
 * @param {number} [options.depth=Infinity] - Maximum depth for nested structures.
 * @returns {Array | Object} The filtered array or object.
 * @throws {Error} If the provided options contain invalid values.
 */
function filterByValue(ele, input, options = {}) {
	const cs = options.cs ?? true;
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) param must be boolean');
	const allowed = undefined;

	/**
	 * Determines whether a value should be removed from the collection
	 * based on the current input and case-sensitivity setting.
	 *
	 * @param {string | number | undefined} key - The object's property key, or undefined for array elements.
	 * @param {any} value - The value currently being evaluated.
	 * @param {any} currentInput - The value to compare against.
	 * @returns {boolean | 'descendInObj' | 'descendInArr'} True when the value should be removed,
	 * or a traversal instruction when the value is a nested collection.
	 */
	function filterFun(key, value, currentInput){

		let isWalkableRes = isWalkable(value);
		if (isWalkableRes) return isWalkableRes;

		value = String(value);
		currentInput = String(currentInput);
		
		if (cs === false) {

			if (currentInput.toLowerCase() === value.toLowerCase()) return true;

		} else if (cs === true) {

			if (currentInput === value) return true;

		}

		return false;

	}

	return filterEngineRouter(ele, input, options, filterFun, allowed);
}

export { filterByValue }