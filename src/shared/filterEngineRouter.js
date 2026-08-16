import { arrayFilterEngine, objectFilterEngine } from '../engines/index.js';

/**
 * Routes filtering operations to the appropriate collection engine.
 *
 * @param {Array | Object} ele - The collection to filter.
 * @param {*} input - The filtering criteria.
 * @param {Object} options - Filtering configuration.
 * @param {Function} filterFun - Function used to evaluate each value.
 * @param {Array<string> | undefined} allowed - Allowed input types for validation.
 * @returns {Array | Object} The filtered collection.
 * @throws {Error} If the provided value is neither an array nor an object.
 */
function filterEngineRouter(ele, input, options, filterFun, allowed) {
	if (Array.isArray(ele)) return arrayFilterEngine(ele, input, options, filterFun, allowed);
	if (typeof ele === 'object' && !Array.isArray(ele) && ele !== null) return objectFilterEngine(ele, input, options, filterFun, allowed);
 	
 	throw new Error('Unsupported type');
}

export { filterEngineRouter }