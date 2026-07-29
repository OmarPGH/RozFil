import { 
    validateDataType,
    validateOptions, 
    sanitizeInput, 
    validateAndTranslateInput, 
    validateDataNotEmpty, 
    cloneData, 
    deleteObjectKeysNonIterative, 
    processObjectLoopingFilter 
} from '../shared/index.js';

function filterEngine(obj, input, inPlace, depth, filterFun, allowed, iterate = true) {
    
    validateOptions(inPlace, depth);

    let isObj = typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
    validateDataType(isObj, 'object');

    let sanitizedInput = sanitizeInput(input);
    if (sanitizedInput.length < 1) return obj;

    sanitizedInput = validateAndTranslateInput(sanitizedInput, allowed);

    let objKeys = Object.keys(obj);
    validateDataNotEmpty(objKeys.length, 'Object items');

    obj = cloneData(obj, inPlace, 'object', '[Symbol, Function, etc]');

    if (!iterate) {
        return deleteObjectKeysNonIterative(obj, sanitizedInput);
    }

    return processObjectLoopingFilter(obj, sanitizedInput, depth, filterFun);
}

export { filterEngine };