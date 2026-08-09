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