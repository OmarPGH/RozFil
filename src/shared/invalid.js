/**
 * @file Fallback marker for unresolvable type aliases.
 */

/**
 * Sentinel returned by {@link module:shared/translator~translator} when an
 * alias matches nothing in the table.
 *
 * Validation rejects any translated list containing this marker, which is how
 * unknown type names surface as a `Type Error` instead of silently matching
 * nothing. The string is deliberately one no real type name would collide with.
 *
 * @type {'invalid/null'}
 */
export const invalid = 'invalid/null';