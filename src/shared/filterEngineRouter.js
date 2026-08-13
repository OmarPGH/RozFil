/**
 * @file Container-type router — the single hand-off point from a filter to an
 * engine.
 */

import { arrayFilterEngine, objectFilterEngine } from '../engines/index.js';

/** @typedef {import('../typedefs.js').Container} Container */
/** @typedef {import('../typedefs.js').CanonicalType} CanonicalType */
/** @typedef {import('../typedefs.js').FilterPredicate} FilterPredicate */
/** @typedef {import('../typedefs.js').FilterOptions} FilterOptions */

/**
 * Dispatches a filter run to the engine matching the container's shape.
 *
 * Both public filters funnel through here, which is why array and object
 * support stays in step: a filter only supplies its matching logic, and the
 * router picks the traversal strategy.
 *
 * @param {Container} ele Container to filter.
 * @param {*} input Criteria to apply — translated type names for `fbType`,
 *   raw values for `fbVal`.
 * @param {FilterOptions} options Traversal settings, forwarded untouched.
 * @param {FilterPredicate} filterFun Per-value matching callback from the filter.
 * @param {CanonicalType[] | undefined} allowed Vocabulary `input` is validated
 *   against, or `undefined` to skip validation.
 * @returns {Container} The filtered container returned by the chosen engine.
 * @throws {Error} `Unsupported type` when `ele` is neither an array nor a plain
 *   object — primitives, `null`, `Date` and `Map` all land here.
 */
function filterEngineRouter(ele, input, options, filterFun, allowed) {
	if (Array.isArray(ele)) return arrayFilterEngine(ele, input, options, filterFun, allowed);
	if (typeof ele === 'object' && !Array.isArray(ele) && ele !== null) return objectFilterEngine(ele, input, options, filterFun, allowed);
 	
 	throw new Error('Unsupported type');
}

export { filterEngineRouter }