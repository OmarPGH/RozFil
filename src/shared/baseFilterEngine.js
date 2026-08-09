import { translator as translate, invalid } from '../shared/index.js';

function validateDataType(condition, type) {
    if (!condition) {
        throw new Error(`this isn\'t ${type}`);
    }
}

function validateOptions(inPlace, depth) {
    if (typeof inPlace !== 'boolean' && inPlace !== undefined) throw new Error('In place (inPlace) option must be boolean');
    if (!Number.isInteger(depth) && depth !== Infinity && depth !== undefined) throw new Error('depth option must be integer or infinity');
}

function sanitizeInput(input) {
    return [...new Set(input)];
}

function validateAndTranslateInput(input, allowed) {
    
    if (allowed !== undefined) {
        let inputLen = input.length;
        let allowedLen = allowed.length;
        if (inputLen > allowedLen) throw new Error(`Types is more than ${allowedLen}`);

        let translatedInput = input;
        for (let i = 0; i < inputLen; i++) {
            translatedInput[i] = translate(`${translatedInput[i]}`);
        }

        if (!translatedInput.every(ele => allowed.includes(ele)) || translatedInput.includes(invalid)) {
            throw new Error(`Type Error, only those allowed : \n ${allowed.join(' - ')}`);
        }
        
        return translatedInput;
    }

    return input;
}

function validateDataNotEmpty(length, thing) {
    if (length < 1) {
        throw new Error(`${thing} is less than 1`);
    }
}

function cloneData(data, inPlace = false, type, nonCloneable) {
    if (inPlace) return data;
    try {
        return structuredClone(data);
    } catch {
        throw new Error(`unable to clone your ${type}.
            \n hint: maybe it contains non-cloneable data type, like ${nonCloneable}.
            \n help: you can set inPlace option to true,\n but this can edit your original data.
        `);
    }
}

function deleteObjectKeysNonIterative(obj, input) {
    for (let i = 0; i < input.length; i++) {
        delete obj[input[i]];
    }
    return obj;
}

function loopingOnObject(obj, currentInput, filterFun, depth, currentDepth = 1) {
    
    let objKeys = Object.keys(obj);
    let objLen = objKeys.length;

    for (let j = 0; j < objLen; j++) {
        let key = objKeys[j];
        let value = obj[key];
        let filterFunResult = filterFun(key, value, currentInput);
        if (filterFunResult === false) {
            continue;
        } else if (filterFunResult === 'descendInObj' && currentDepth < depth) {
            loopingOnObject(value, currentInput, filterFun, depth, currentDepth + 1);
        } else if (filterFunResult === 'descendInArr' && currentDepth < depth) {
            loopingOnArray(value, currentInput, filterFun, depth, currentDepth + 1);
        } else if (filterFunResult === true) {
            delete obj[key];
        }
    }
}

function loopingOnArray(arr, currentInput, filterFun, depth, currentDepth = 1) {

    let arrLen = arr.length;
    let writeIndex = 0;

    for (let j = 0; j < arrLen; j++) {
        let ele = arr[j];
        let filterFunResult = filterFun(undefined, ele, currentInput);
        if (filterFunResult === false) {
            arr[writeIndex] = ele;
            writeIndex++;
        } else if (filterFunResult === 'descendInArr') {
            arr[writeIndex] = ele;
            writeIndex++;
            if (currentDepth < depth) {
                loopingOnArray(ele, currentInput, filterFun, depth, currentDepth + 1);
            }
        } else if (filterFunResult === 'descendInObj') {
            arr[writeIndex] = ele;
            writeIndex++;
            if (currentDepth < depth) {
                loopingOnObject(ele, currentInput, filterFun, depth, currentDepth + 1);
            }
        }
    }

    arrLen = writeIndex; 
    arr.length = arrLen; 

}

function processObjectFilter(obj, input, depth = Infinity, filterFun) {
    const inputLen = input.length;

    for (let i = 0; i < inputLen; i++) {
        loopingOnObject(obj, input[i], filterFun, depth);
    }

    return obj;
}

function processArrayFilter(arr, input, depth = Infinity, filterFun) {
    const inputLen = input.length;

    for (let i = 0; i < inputLen; i++) {
        loopingOnArray(arr, input[i], filterFun, depth);
    }

    return arr;
}

export {
    validateDataType,
    validateOptions,
    sanitizeInput,
    validateAndTranslateInput,
    validateDataNotEmpty,
    cloneData,
    deleteObjectKeysNonIterative,
    processObjectFilter,
    processArrayFilter
};