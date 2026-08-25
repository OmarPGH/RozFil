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