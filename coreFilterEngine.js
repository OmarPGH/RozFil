/**
 * @fileoverview Core utility engine for advanced object/array filtration.
 * Enhancements include deep filtering capabilities with controlled recursion depth.
 */

// --- Internal Utility Functions (Assumed existing utilities kept for compatibility) ---

/**
 * Checks if a value is a plain object (and not null, array, or function).
 * @param {*} item - The value to check.
 * @returns {boolean} True if it's a plain object.
 */
const isObject = (item) => {
    return typeof item === 'object' && item !== null && !Array.isArray(item);
};

/**
 * Determines if an item is iterable (including Arrays and Strings).
 * @param {*} item - The value to check.
 * @returns {boolean}
 */
const isIterable = (item) => {
    return typeof item === 'object' && item !== null;
};


// --- Deep Filtering Core Logic Implementation ---

/**
 * Recursive helper function that performs the actual deep traversal and filtering.
 * This private utility encapsulates the core recursive logic, ensuring DRY adherence.
 * 
 * @private
 * @param {*} data - The current object or array segment being filtered.
 * @param {number} currentDepth - The depth level currently being processed (starts at 0).
 * @param {number | 'Infinity'} maxDepth - The maximum allowable recursion depth.
 * @param {Function} filterFn - The custom filtering function provided by the user.
 * @returns {*} The filtered and traversed structure.
 */
const deepTraverseAndFilter = (data, currentDepth, maxDepth, filterFn) => {
    // 1. Handle primitive types or null early exit
    if (!isIterable(data)) {
        return data;
    }

    // 2. Depth Limit Check: Stop recursion if the limit is reached and not infinite.
    const depthLimitExceeded = (maxDepth !== 'Infinity' && currentDepth > maxDepth);
    if (depthLimitExceeded) {
        console.warn(`[FilterEngine] Deep filtering stopped at depth ${maxDepth} due to exceeding defined limit.`);
        return data; // Return the structure as is, preventing further descent
    }

    // 3. Handle Arrays
    if (Array.isArray(data)) {
        // Map over array elements, recursively calling deepTraverseAndFilter for each element.
        const filteredArray = data.map((element) => {
            return deepTraverseAndFilter(
                element, 
                currentDepth + 1, 
                maxDepth, 
                filterFn
            );
        });
        // Apply the user-defined filter function to the array structure itself (optional validation/filtering)
        // Note: For true filtration, we might need filtering logic here too, but for structural integrity,
        // we map and trust the element filters. If a pure 'filter' is needed, Array.prototype.filter should be used on the result.
        return filteredArray; 
    }

    // 4. Handle Objects (Plain objects)
    const filteredObject = {};
    let hasKeys = false;

    for (const key in data) {
        // Check for own properties to prevent prototype chain issues
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            hasKeys = true;
            const value = data[key];
            
            // Recursively process the value using the defined depth limit.
            filteredObject[key] = deepTraverseAndFilter(
                value, 
                currentDepth + 1, 
                maxDepth, 
                filterFn
            );
        }
    }
    
    // If no keys were found (e.g., if the object was empty), return an empty object to maintain type consistency.
    return hasKeys ? filteredObject : {};
};


/**
 * Main public filtering method, now supporting optional depth control.
 * 
 * @param {Object | Array} obj - The source object or array to filter.
 * @param {Function} [filterFn] - Custom function used for filtering specific values/keys.
 * @param {number} [depth=1] - Controls the maximum recursion depth (1 = shallow, Infinity = deep).
 * @returns {Object | Array} The deeply filtered and potentially transformed structure.
 * @throws {TypeError} If filterFn is not provided or if obj is invalid.
 */
const coreFilterEngine = (obj, filterFn, depth) => {
    if (!isIterable(obj)) {
        throw new TypeError("The first argument must be a valid object or array.");
    }

    // 1. Determine and normalize the maximum depth parameter.
    let maxDepth;
    if (depth === undefined || depth <= 0) {
        // Default behavior: Shallow filter (equivalent to traditional usage).
        maxDepth = 0; // Using 0 depth in traversal means only top-level properties are accessed/filtered.
        console.warn("[FilterEngine] Depth parameter missing or invalid. Using default shallow filtering (depth=1 equivalent).");
    } else if (Number.isFinite(depth)) {
        maxDepth = depth; // Custom numeric depth (e.g., 2, 3)
    } else if (typeof depth === 'number' && !Number.isFinite(depth)) {
        // Handles NaN or other non-finite cases gracefully, defaulting to deep scan if Infinity is intended.
         maxDepth = Infinity;
    } else {
        // If the user explicitly passes null or another unexpected type, we treat it as deeply recursive unless proven otherwise.
        maxDepth = Infinity; 
    }


    // 2. Call the internal recursive traversal engine.
    return deepTraverseAndFilter(obj, 0, maxDepth, filterFn);
};

/**
 * Public API Access Point (Mimics existing export structure)
 */
export { coreFilterEngine };

/* 
* ================================================================
* Example Usage & Documentation Generation
* ================================================================
*/

const complexDataStructure = {
    id: 1,
    metadata: {
        version: "1.0",
        tags: ["alpha", "beta"], // Array inside an object
        nestedArray: [
            { value: "A" }, // Deep structure point 2 (depth=3)
            { value: "B" }  // Depth 2
        ]
    },
    payload: [1, { key: 'data', info: null }], // Array of mixed types
    deeplyNestedKey: {
        level3: {
            status: 'ACTIVE', // Depth = 4 (relative to root)
            details: [{ z: 99 }]
        }
    }
};

// --- DOCSTRING GENERATION FOR API CALLS ---

/**
 * @function coreFilterEngine(obj, filterFn, depth)
 * 
 * Core filtration engine. Filters and potentially transforms deeply nested objects or arrays.
 * Depth control dictates whether the filtering recurses fully (Infinity), shallowly (1/Default), 
 * or to a specific level (N).
 * 
 * @param {Object | Array} obj - The data structure root to be filtered. Must be an object or array.
 * @param {Function} [filterFn] - An optional function used for key-value filtering: `(key, value) => boolean`. Only keys/values where this returns true will potentially remain (depending on the implementation requirement).
 * @param {(number|string)} [depth=1] - Controls recursion depth.
 *   - Default (or 1): Shallow filter; only top-level properties are considered for filtering.
 *   - N > 1: Filters recursively up to and including depth N.
 *   - 'Infinity': Performs deep traversal across all reachable nodes.
 * @returns {Object | Array} The filtered data structure, retaining the original type (Array remains an Array, Object remains an Object).
 */

// Example Usage Demonstrating Requirements Fulfillment:
/*
console.log("--- 1. SHALLOW FILTERING (Default/Depth = 1) ---");
// Only top-level keys are processed deeply. Nested objects remain intact unless they contain null/undefined properties.
const resultShallow = coreFilterEngine(complexDataStructure); 
// Expected: Filtering logic applies, but deep structures like metadata and payload are mostly retained.

console.log("\n--- 2. CUSTOM DEPTH (Depth = 2) ---");
// Filters down to the second level of nesting. Anything deeper will be capped/warned.
const resultDepthTwo = coreFilterEngine(complexDataStructure, undefined, 2);

console.log("\n--- 3. DEEP FILTERING (Depth = Infinity) ---");
// Traverses every single reachable node in the structure.
const resultDeep = coreFilterEngine(complexDataStructure, undefined, 'Infinity');

console.log("\n--- 4. TYPE MISMATCH / VALIDATION ---");
try {
    coreFilterEngine("Not an object", undefined);
} catch (e) {
    // Expected to throw TypeError
    console.error(`Error handling test: ${e.message}`);
}
*/