import { 
    validateDataType,
    validateOptions, 
    sanitizeInput, 
    validateAndTranslateInput, 
    validateDataNotEmpty, 
    cloneData, 
    processArrayFilter 
} from '../shared/index.js';

/** @typedef {import('../typedefs.js').CanonicalType} CanonicalType */
/** @typedef {import('../typedefs.js').FilterPredicate} FilterPredicate */
/** @typedef {import('../typedefs.js').FilterOptions} FilterOptions */

/**
 * Runs a filter over an array.
 *
 * Sequences the fixed pipeline every array run shares: validate options and
 * shape, de-duplicate and translate the criteria, clone unless filtering in
 * place, then hand off to the two-pointer compaction loop. Criteria are
 * applied one at a time, each as a full pass over the array.
 *
 * An empty criteria list short-circuits and returns the array untouched — and
 * notably returns the *original* reference, before any cloning happens.
 *
 * @param {any[]} arr Array to filter.
 * @param {*} input Criteria to apply.
 * @param {FilterOptions} options Traversal settings.
 * @param {FilterPredicate} filterFun Per-value matching callback.
 * @param {CanonicalType[] | undefined} allowed Vocabulary to validate `input`
 *   against, or `undefined` to skip translation.
 * @returns {any[]} The filtered array — a clone by default, `arr` itself when
 *   `options.inPlace` is `true`.
 * @throws {Error} `this isn't array` when `arr` is not an array.
 * @throws {Error} `Array length is less than 1` when `arr` is empty.
 * @throws {Error} `unable to clone your array` when cloning fails on
 *   non-cloneable members such as symbols.
 * @throws {Error} From {@link module:shared/baseFilterEngine~validateOptions}
 *   and {@link module:shared/baseFilterEngine~validateAndTranslateInput} on
 *   malformed options or unknown type names.
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