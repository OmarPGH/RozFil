/**
 * @file Core validation helpers, cloning, and the traversal loops both engines
 * are built from.
 */

import { translator as translate, invalid } from '../shared/index.js';

/** @typedef {import('../typedefs.js').CanonicalType} CanonicalType */
/** @typedef {import('../typedefs.js').FilterPredicate} FilterPredicate */

/**
 * Asserts a shape check that the caller has already evaluated.
 *
 * Takes the boolean rather than the value so each engine can decide for itself
 * what counts as its container type.
 *
 * @param {boolean} condition Result of the caller's own type test.
 * @param {string} type Type name used to build the message.
 * @returns {void}
 * @throws {Error} `this isn't <type>` when `condition` is falsy.
 */
function validateDataType(condition, type) {
    if (!condition) {
        throw new Error(`this isn\'t ${type}`);
    }
}

/**
 * Validates the two options every engine understands.
 *
 * `undefined` passes for both, so omitting an option is always legal; only a
 * supplied value of the wrong type is rejected.
 *
 * @param {boolean} [inPlace] Mutation flag to check.
 * @param {number} [depth] Depth limit to check. `Infinity` is accepted
 *   alongside integers.
 * @returns {void}
 * @throws {Error} `In place (inPlace) option must be boolean` when `inPlace` is
 *   present and not a boolean.
 * @throws {Error} `depth option must be integer or infinity` when `depth` is
 *   present and is neither an integer nor `Infinity` — `1.5` is rejected.
 */
function validateOptions(inPlace, depth) {
    if (typeof inPlace !== 'boolean' && inPlace !== undefined) throw new Error('In place (inPlace) option must be boolean');
    if (!Number.isInteger(depth) && depth !== Infinity && depth !== undefined) throw new Error('depth option must be integer or infinity');
}

/**
 * Normalizes the criteria into a de-duplicated array.
 *
 * A lone criterion is wrapped rather than passed through, so everything
 * downstream can assume an array. That is what lets `fbType(data, 'num')` work
 * alongside `fbType(data, ['num'])`: without the wrap, the translation step
 * would index into the string and try to write back into it.
 *
 * Each distinct criterion costs a full pass over the container, so dropping
 * repeats is a real saving. Copying through a `Set` also means the caller's
 * own array is never mutated by the translation step that follows.
 *
 * @param {*} input Criteria supplied by the user — an array, or a single value.
 * @returns {any[]} A de-duplicated copy of an array input, or a single-element
 *   array wrapping any other value.
 * @throws {Error} `Invalid input: input mustn't be an object` when `input` is a
 *   non-array object, which would otherwise be silently misread as a criterion.
 */
function sanitizeInput(input) {
    if (Array.isArray(input)) {
        return [...new Set(input)];
    } else if (typeof input === 'object' && input !== null) {
        throw new Error("Invalid input: input mustn't be an object");
    } else {
        return [input];
    }
}

/**
 * Translates every criterion to its canonical name and checks it is selectable.
 *
 * Only runs for `fbType`, which supplies an `allowed` vocabulary. `fbVal`
 * passes `undefined` and the list is returned untouched, since arbitrary values
 * have no vocabulary to validate against.
 *
 * The array is rewritten in place, which is safe only because
 * {@link sanitizeInput} handed over a copy.
 *
 * @param {*} input De-duplicated criteria list.
 * @param {CanonicalType[]} [allowed] Names selectable at the active rigor, or
 *   `undefined` to skip validation entirely.
 * @returns {*} The translated criteria, or `input` unchanged when `allowed` is
 *   `undefined`.
 * @throws {Error} `Types is more than N` when `input` holds more entries than
 *   `allowed` has names.
 * @throws {Error} `Type Error, only those allowed at the selected rigor` when a
 *   name is unrecognized, or is valid but not selectable at this rigor.
 * @throws {TypeError} When `input` is a string rather than an array — its
 *   characters cannot be written back to.
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
 * Rejects an empty container before any filtering work begins.
 *
 * @param {number} length Measured size — array length, or own-key count.
 * @param {string} thing Label used to build the message.
 * @returns {void}
 * @throws {Error} `<thing> is less than 1` when `length` is `0`. Filtering an
 *   empty array or object is treated as a caller mistake rather than a no-op.
 */
function validateDataNotEmpty(length, thing) {
    if (length < 1) {
        throw new Error(`${thing} is less than 1`);
    }
}

/**
 * Returns the container the filter should actually write to.
 *
 * Filtering is destructive — values are deleted and arrays are compacted — so
 * unless the caller opted into mutation, the work happens on a deep copy and
 * the caller's data is left alone.
 *
 * `structuredClone` is what makes the copy deep, but it also cannot carry
 * symbols or functions, which is why opting into `inPlace` is the documented
 * escape hatch for containers holding them.
 *
 * @param {*} data Container to clone.
 * @param {boolean} [inPlace=false] When `true`, returns `data` as-is.
 * @param {string} type Container label used in the error message.
 * @param {string} nonCloneable Example offenders named in the error message.
 * @returns {*} `data` itself when `inPlace`, otherwise a deep clone.
 * @throws {Error} `unable to clone your <type>` when `structuredClone` rejects
 *   the data.
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
 * Deletes top-level properties by name, without inspecting any values.
 *
 * The shortcut behind `objectFilterEngine`'s `iterate = false` path: when the
 * criteria are already property names there is nothing to match, so the walk
 * is skipped entirely.
 *
 * @param {Record<string, any>} obj Object to delete from. Mutated directly.
 * @param {string[]} input Property names to remove. Names not present are
 *   ignored.
 * @returns {Record<string, any>} The same `obj` reference, for chaining.
 */
function deleteObjectKeysNonIterative(obj, input) {
    for (let i = 0; i < input.length; i++) {
        delete obj[input[i]];
    }
    return obj;
}

/**
 * Walks an object for a single criterion, deleting matches as it goes.
 *
 * Keys are snapshotted up front, so deleting during the walk is safe. When
 * `filterFun` reports a nested container the walk recurses into it via the
 * matching helper, which is how arrays nested inside objects stay covered.
 *
 * Recursion stops once `currentDepth` reaches `depth`; the container is still
 * kept, just not descended into.
 *
 * @param {Record<string, any>} obj Object to walk. Mutated in place.
 * @param {*} currentInput The single criterion being applied on this pass.
 * @param {FilterPredicate} filterFun Per-value matching callback.
 * @param {number} depth Maximum nesting level to descend into.
 * @param {number} [currentDepth=1] Current nesting level. Internal to the
 *   recursion — callers should leave it unset.
 * @returns {void} Works by mutation; nothing is returned.
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
 * Walks an array for a single criterion, compacting survivors as it goes.
 *
 * Uses a two-pointer write compaction rather than `splice` or `filter`: `j`
 * reads, `writeIndex` writes, and survivors are copied down over the gaps left
 * by removed items. Truncating `arr.length` at the end discards the tail. That
 * keeps the pass O(n) with no intermediate array, where repeated `splice`
 * calls would be O(n²).
 *
 * @param {any[]} arr Array to walk. Mutated in place, including its length.
 * @param {*} currentInput The single criterion being applied on this pass.
 * @param {FilterPredicate} filterFun Per-value matching callback.
 * @param {number} depth Maximum nesting level to descend into.
 * @param {number} [currentDepth=1] Current nesting level. Internal to the
 *   recursion — callers should leave it unset.
 * @returns {void} Works by mutation; nothing is returned.
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
 * Applies every criterion to an object, one full walk each.
 *
 * Separate passes keep the matching logic simple — `filterFun` only ever
 * compares against one criterion — at the cost of re-walking the object per
 * entry in `input`.
 *
 * @param {Record<string, any>} obj Object to filter. Mutated in place.
 * @param {any[]} input Criteria to apply. Always an array — {@link sanitizeInput}
 *   wraps a lone criterion before it reaches here.
 * @param {number} [depth=Infinity] Maximum nesting level to descend into.
 * @param {FilterPredicate} filterFun Per-value matching callback.
 * @returns {Record<string, any>} The same `obj` reference, filtered.
 */
function processObjectFilter(obj, input, depth = Infinity, filterFun) {
    const inputLen = input.length;

    for (let i = 0; i < inputLen; i++) {
        loopingOnObject(obj, input[i], filterFun, depth);
    }

    return obj;
}

/**
 * Applies every criterion to an array, one full pass each.
 *
 * The counterpart to {@link processObjectFilter}, differing only in that
 * removal compacts the array rather than deleting keys.
 *
 * @param {any[]} arr Array to filter. Mutated in place.
 * @param {any[]} input Criteria to apply. Always an array — {@link sanitizeInput}
 *   wraps a lone criterion before it reaches here.
 * @param {number} [depth=Infinity] Maximum nesting level to descend into.
 * @param {FilterPredicate} filterFun Per-value matching callback.
 * @returns {any[]} The same `arr` reference, filtered and compacted.
 */
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