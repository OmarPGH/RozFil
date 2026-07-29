import { 
    validateDataType,
    validateOptions, 
    sanitizeInput, 
    validateAndTranslateInput, 
    validateDataNotEmpty, 
    cloneData, 
    processArrayLoopingFilter 
} from '../shared/index.js';

function filterEngine(arr, input, inPlace, depth, filterFun, allowed) {

    validateOptions(inPlace);
    validateDataType(Array.isArray(arr), 'array');

    let sanitizedInput = sanitizeInput(input);
    if (sanitizedInput.length < 1) return arr;

    sanitizedInput = validateAndTranslateInput(sanitizedInput, allowed);

    validateDataNotEmpty(arr.length, 'Array length');
    
    arr = cloneData(arr, inPlace, 'array', '[Symbol]');

    return processArrayLoopingFilter(arr, sanitizedInput, filterFun);
}

export { filterEngine };