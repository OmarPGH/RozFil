/**
 * @file Public entry point for RozFil.
 *
 * Exposes the two filters under their short public names. Both operate on an
 * exclusion model — you name what should be removed, and everything else
 * survives.
 *
 * @example
 * import { fbType, fbVal } from 'rozfil';
 *
 * fbType([1, 'a', null], ['num'], { rigor: 2 }); // => ['a', null]
 * fbVal(['a', 'b'], ['a']);                      // => ['b']
 *
 * @see {@link module:filters/filterByType~filterByType}
 * @see {@link module:filters/filterByValue~filterByValue}
 */

export { filterByValue as fbVal } from './filters/filterByValue.js';
export { filterByType as fbType } from './filters/filterByType.js';