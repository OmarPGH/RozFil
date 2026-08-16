import { 
    validateDataType,
    validateOptions, 
    sanitizeInput, 
    validateAndTranslateInput, 
    validateDataNotEmpty, 
    cloneData, 
    processArrayFilter 
} from '../shared/index.js';

/**
 * Applies filtering logic to an array.
 *
 * Validates the filtering options and input, optionally clones the array,
 * and processes its elements according to the provided filter function.
 *
 * @param {Array} arr - The array to filter.
 * @param {*} input - The type or value criteria used for filtering.
 * @param {Object} options - Filtering configuration.
 * @param {boolean} [options.inPlace] - Whether to modify the original array.
 * @param {number} [options.depth=Infinity] - Maximum traversal depth.
 * @param {Function} filterFun - Function used to determine whether elements should be filtered.
 * @param {Array | undefined} allowed - Allowed input types for validation.
 * @returns {Array} The filtered array.
 * @throws {Error} If the array, options, or filtering input is invalid.
 */
function arrayFilterEngine(arr, input, options, filterFun, allowed) {
    
    validateOptions(options.inPlace, options.depth);
    validateDataType(Array.isArray(arr), 'array');

    let sanitizedInput = sanitizeInput(input);
    if (sanitizedInput.length < 1) return arr;

    sanitizedInput = validateAndTranslateInput(sanitizedInput, allowed);

    validateDataNotEmpty(arr.length, 'Array length');
    
    arr = cloneData(arr, options.inPlace, 'array', '[Symbol]');

    return processArrayFilter(arr, sanitizedInput, options.depth, filterFun);
}

export { arrayFilterEngine };