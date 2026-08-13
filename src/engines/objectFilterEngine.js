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

/** @typedef {import('../typedefs.js').CanonicalType} CanonicalType */
/** @typedef {import('../typedefs.js').FilterPredicate} FilterPredicate */
/** @typedef {import('../typedefs.js').FilterOptions} FilterOptions */

/**
 * Runs a filter over a plain object.
 *
 * Mirrors {@link module:engines/arrayFilterEngine~arrayFilterEngine}: validate,
 * de-duplicate and translate the criteria, clone unless filtering in place,
 * then walk. Removal uses `delete` rather than compaction, since objects have
 * no index to close up.
 *
 * An empty criteria list short-circuits and returns the object untouched — and
 * returns the *original* reference, before any cloning happens.
 *
 * @param {Record<string, any>} obj Object to filter.
 * @param {*} input Criteria to apply.
 * @param {FilterOptions} options Traversal settings.
 * @param {FilterPredicate} filterFun Per-value matching callback.
 * @param {CanonicalType[] | undefined} allowed Vocabulary to validate `input`
 *   against, or `undefined` to skip translation.
 * @param {boolean} [iterate=true] When `false`, skips value matching entirely
 *   and treats `input` as a list of top-level property *names* to delete. No
 *   caller passes `false` today; the router always takes the default path.
 * @returns {Record<string, any>} The filtered object — a clone by default,
 *   `obj` itself when `options.inPlace` is `true`.
 * @throws {Error} `this isn't object` when `obj` is not a plain object.
 * @throws {Error} `Object items is less than 1` when `obj` has no own keys.
 * @throws {Error} `unable to clone your object` when cloning fails on
 *   non-cloneable members such as symbols or functions.
 * @throws {Error} From {@link module:shared/baseFilterEngine~validateOptions}
 *   and {@link module:shared/baseFilterEngine~validateAndTranslateInput} on
 *   malformed options or unknown type names.
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