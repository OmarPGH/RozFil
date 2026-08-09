import { 
    validateDataType,
    validateOptions, 
    sanitizeInput, 
    validateAndTranslateInput, 
    validateDataNotEmpty, 
    cloneData, 
    processArrayFilter 
} from '../shared/index.js';

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