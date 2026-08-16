import { translator as translate, invalid } from '../shared/index.js';


/**
 * Validates whether a condition is true for the expected data type.
 *
 * @param {boolean} condition - Whether the provided data matches the expected type.
 * @param {string} type - The expected data type name.
 * @returns {void}
 * @throws {Error} If the condition is false.
 */
function validateDataType(condition, type) {
    if (!condition) {
        throw new Error(`this isn\'t ${type}`);
    }
}

/**
 * Validates the filtering options for in-place mutation and traversal depth.
 *
 * @param {boolean | undefined} inPlace - Whether the original data should be modified.
 * @param {number | undefined} depth - Maximum traversal depth, or Infinity for unlimited depth.
 * @returns {void}
 * @throws {Error} If inPlace is not a boolean or depth is not an integer or Infinity.
 */
function validateOptions(inPlace, depth) {
    if (typeof inPlace !== 'boolean' && inPlace !== undefined) throw new Error('In place (inPlace) option must be boolean');
    if (!Number.isInteger(depth) && depth !== Infinity && depth !== undefined) throw new Error('depth option must be integer or infinity');
}

/**
 * Sanitizes filter input by removing duplicate values from arrays.
 *
 * @param {*} input - Filter input, either a single value or an array of values.
 * @returns {*} The sanitized input.
 * @throws {Error} If the input is a non-null object.
 */
function sanitizeInput(input) {
    if (Array.isArray(input)) {
        return [...new Set(input)];
    } else if (typeof input === 'object' && input !== null) {
        throw new Error("Invalid input: input mustn't be an object");
    } else {
        return input;
    }
}

/**
 * Validates filter input against the allowed types and translates type aliases
 * into their canonical names.
 *
 * @param {Array} input - Filter types or type aliases to validate and translate.
 * @param {Array<string>} allowed - Canonical type names allowed for the current rigor level.
 * @returns {Array<string>} The translated type names.
 * @throws {Error} If the input contains too many types or an unsupported type.
 */
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
            throw new Error(`Type Error, only those allowed at the selected rigor : \n [ ${allowed.join(' / ')} ].\n hint: rigor = 1 by default`);
        }
        
        return translatedInput;
    }

    return input;
}

/**
 * Validates that a collection contains at least one item.
 *
 * @param {number} length - Number of items in the collection.
 * @param {string} thing - Name of the collection used in the error message.
 * @returns {void}
 * @throws {Error} If the provided length is less than 1.
 */
function validateDataNotEmpty(length, thing) {
    if (length < 1) {
        throw new Error(`${thing} is less than 1`);
    }
}

/**
 * Clones data unless in-place mutation is enabled.
 *
 * @param {Array | Object} data - Data to clone.
 * @param {boolean} [inPlace=false] - Whether to return the original data instead of cloning it.
 * @param {string} type - Data type name used in the error message.
 * @param {string} nonCloneable - Example of a non-cloneable value used in the error message.
 * @returns {Array | Object} The cloned data, or the original data when inPlace is true.
 * @throws {Error} If the data cannot be cloned with structuredClone.
 */
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

/**
 * Deletes specified keys from an object.
 *
 * @param {Object} obj - Object from which keys should be deleted.
 * @param {Array<string>} input - Keys to delete.
 * @returns {Object} The modified object.
 */
function deleteObjectKeysNonIterative(obj, input) {
    for (let i = 0; i < input.length; i++) {
        delete obj[input[i]];
    }
    return obj;
}

/**
 * Iterates through an object and applies a filter function to each property.
 *
 * @param {Object} obj - Object to iterate through.
 * @param {*} currentInput - Current filter criterion.
 * @param {Function} filterFun - Function used to determine whether a value should be removed or traversed.
 * @param {number} depth - Maximum traversal depth.
 * @param {number} [currentDepth=1] - Current traversal depth.
 * @returns {void}
 */
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

/**
 * Iterates through an array and applies a filter function to each element.
 *
 * @param {Array} arr - Array to iterate through.
 * @param {*} currentInput - Current filter criterion.
 * @param {Function} filterFun - Function used to determine whether an element should be removed or traversed.
 * @param {number} depth - Maximum traversal depth.
 * @param {number} [currentDepth=1] - Current traversal depth.
 * @returns {void}
 */
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

/**
 * Processes an object using one or more filter criteria.
 *
 * @param {Object} obj - Object to filter.
 * @param {Array|string} input - Filter criterion or criteria.
 * @param {number} [depth=Infinity] - Maximum traversal depth.
 * @param {Function} filterFun - Function used to determine which values to remove.
 * @returns {Object} The filtered object.
 */
function processObjectFilter(obj, input, depth = Infinity, filterFun) {
    const inputLen = input.length;

    if (!Array.isArray(input)) {
        loopingOnObject(obj, input, filterFun, depth);
    } else {
        for (let i = 0; i < inputLen; i++) {
            loopingOnObject(obj, input[i], filterFun, depth);
        }
    }

    return obj;
}

/**
 * Processes an array using one or more filter criteria.
 *
 * @param {Array} arr - Array to filter.
 * @param {Array|string} input - Filter criterion or criteria.
 * @param {number} [depth=Infinity] - Maximum traversal depth.
 * @param {Function} filterFun - Function used to determine which elements to remove.
 * @returns {Array} The filtered array.
 */
function processArrayFilter(arr, input, depth = Infinity, filterFun) {
    const inputLen = input.length;

    if (!Array.isArray(input)) {
        loopingOnArray(arr, input, filterFun, depth);
    } else {    
        for (let i = 0; i < inputLen; i++) {
            loopingOnArray(arr, input[i], filterFun, depth);
        }
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

