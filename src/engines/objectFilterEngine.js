import { 
    validateDataType,
    validateOptions, 
    sanitizeInput, 
    validateAndTranslateInput, 
    validateDataNotEmpty, 
    cloneData, 
    processObjectFilter 
} from '../core/index.js';

function objectFilterEngine(obj, input, options, filterFun, allowed) {
    
    validateOptions(options.inPlace, options.depth);

    let isObj = typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
    validateDataType(isObj, 'object');

    let sanitizedInput = sanitizeInput(input);
    if (sanitizedInput.length < 1) return obj;

    sanitizedInput = validateAndTranslateInput(sanitizedInput, allowed);

    let objKeys = Object.keys(obj);
    validateDataNotEmpty(objKeys.length, 'Object items');

    obj = cloneData(obj, options.inPlace, 'object', '[Symbol, Function, etc]');

    return processObjectFilter(obj, sanitizedInput, options.depth, filterFun);
}

export { objectFilterEngine };