/**
 * @file Barrel for the shared layer — alias translation, walk detection,
 * container routing, validation helpers and the traversal loops. Internal:
 * these are consumed by the filters and engines, not by library users.
 */

export { translator } from './translator.js';
export { invalid } from './invalid.js';
export { isWalkable } from './isWalkable.js';
export { isValidJSONObjectOrArray } from './jsonValidator.js';
export { filterEngineRouter } from './filterEngineRouter.js';
export * from './baseFilterEngine.js';
export * as reBook from './regexBook.js';