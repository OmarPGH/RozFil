import { 
    validateDataType,
    validateOptions, 
    sanitizeInput, 
    validateAndTranslateInput, 
    validateDataNotEmpty, 
    cloneData, 
    deleteObjectKeysNonIterative, 
    processObjectFilter 
} from '../shared/index.js';

/**
 * Applies filtering logic to an object.
 *
 * Validates the filtering options and input, optionally clones the object,
 * and processes its properties according to the provided filter function.
 *
 * @param {Object} obj - The object to filter.
 * @param {*} input - The type or value criteria used for filtering.
 * @param {Object} options - Filtering configuration.
 * @param {boolean} [options.inPlace] - Whether to modify the original object.
 * @param {number} [options.depth=Infinity] - Maximum traversal depth.
 * @param {Function} filterFun - Function used to determine whether properties should be filtered.
 * @param {Array | undefined} allowed - Allowed input types for validation.
 * @param {boolean} [iterate=true] - Whether to recursively process the object.
 * @returns {Object} The filtered object.
 * @throws {Error} If the object, options, or filtering input is invalid.
 */
function objectFilterEngine(obj, input, options, filterFun, allowed, iterate = true) {
    
    validateOptions(options.inPlace, options.depth);

    let isObj = typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
    validateDataType(isObj, 'object');

    let sanitizedInput = sanitizeInput(input);
    if (sanitizedInput.length < 1) return obj;

    sanitizedInput = validateAndTranslateInput(sanitizedInput, allowed);

    let objKeys = Object.keys(obj);
    validateDataNotEmpty(objKeys.length, 'Object items');

    obj = cloneData(obj, options.inPlace, 'object', '[Symbol, Function, etc]');

    if (!iterate) {
        return deleteObjectKeysNonIterative(obj, sanitizedInput);
    }

    return processObjectFilter(obj, sanitizedInput, options.depth, filterFun);
}

export { objectFilterEngine };