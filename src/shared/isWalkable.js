
/**
 * Determines whether a value is a nested object or array that can be traversed.
 *
 * @param {*} value - The value to inspect.
 * @returns {'descendInObj' | 'descendInArr' | undefined}
 * Returns a traversal instruction for objects or arrays, otherwise undefined.
 */
function isWalkable(value) {
    const isObject = !(typeof value !== 'object' || Array.isArray(value) || value === null);
    const isArray = Array.isArray(value);
        
    if (isObject) {
        return 'descendInObj';
    }

    if (isArray) {
        return 'descendInArr';
    }
}

export { isWalkable };