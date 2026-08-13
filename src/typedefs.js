/**
 * @file Central JSDoc type definitions for RozFil.
 *
 * This module contains no runtime code. It exists so the object shapes used
 * across the library (options bags, filter callbacks, walk signals) are
 * declared once and reused everywhere. Consuming modules alias what they need
 * with a one-line typedef import, in the form
 * `import('../typedefs.js').FbTypeOptions` — see the header of any file in
 * `src/filters` for the pattern.
 *
 * Editors such as VS Code resolve those imports automatically, so hover
 * tooltips and auto-completion work without a TypeScript migration.
 */

/**
 * A container RozFil knows how to filter.
 *
 * Anything else (primitives, `null`, `Date`, `Map`, ...) is rejected by
 * {@link module:shared/filterEngineRouter~filterEngineRouter} with
 * `Unsupported type`.
 *
 * @typedef {any[] | Record<string, any>} Container
 */

/**
 * Canonical type name produced by the translator.
 *
 * Every alias accepted on the public API is normalized to one of these before
 * it reaches an engine.
 *
 * @typedef {'string' | 'number' | 'boolean' | 'undefined' | 'function' | 'null'
 *   | 'array' | 'object' | 'NaN' | 'bigint' | 'Infinity' | 'symbol' | 'true'
 *   | 'false' | 'emptyString' | 'emptyStringWithSpaces'
 *   | 'emptyStringOrWithSpaces' | 'emptyObject' | 'emptyArray' | 'date'
 * } CanonicalType
 */

/**
 * A type name accepted by {@link filterByType}, in shorthand or canonical form.
 *
 * Matching is case-insensitive and surrounding whitespace is trimmed, so
 * `'STR'`, `' str '` and `'string'` are equivalent. The union below lists the
 * lowercase spellings so editors can auto-complete them; the `string & {}`
 * member keeps any other casing assignable instead of reporting a false error.
 *
 * @typedef {'str' | 'string' | 'num' | 'number' | 'bln' | 'boolean' | 'uf'
 *   | 'undefined' | 'fun' | 'function' | 'nl' | 'null' | 'arr' | 'array'
 *   | 'obj' | 'object' | 'nan' | 'bi' | 'bigint' | 'ifty' | 'infinity'
 *   | 'smbl' | 'symbol' | 'tru' | 'true' | 'fls' | 'false' | 'emptystr'
 *   | 'emptystring' | 'ss' | 'emptystringwithspaces' | 'ss?'
 *   | 'emptystringorwithspaces' | '{s?}' | 'emptyobj' | 'emptyobject'
 *   | '[s?]' | 'emptyarr' | 'emptyarray' | 'date' | (string & {})
 * } TypeAlias
 */

/**
 * Type-detection precision level used by {@link filterByType}.
 *
 * - `1` — plain `typeof` comparison. Only the seven `typeof` results are
 *   selectable, so `null` and `NaN` are indistinguishable from `object` and
 *   `number`.
 * - `2` — strict native differentiation. Separates `null`, `NaN`, `Infinity`,
 *   `array` and `object` from each other; `date` matches parseable date
 *   strings.
 * - `3` — everything level 2 offers, plus stringified detection: `'123'`
 *   counts as a number, `'true'` as a boolean, `'[1,2]'` as an array, and the
 *   `empty*` aliases become selectable.
 *
 * @typedef {1 | 2 | 3} Rigor
 */

/**
 * Options shared by every public filter.
 *
 * @typedef {object} FilterOptions
 * @property {number} [depth=Infinity] How many levels of nested containers to
 *   descend into. `1` inspects only the top level. Must be an integer or
 *   `Infinity`.
 * @property {boolean} [inPlace=false] When `true` the original container is
 *   mutated and returned. When `false` the input is copied with
 *   `structuredClone` first, which throws on non-cloneable members such as
 *   symbols and functions.
 */

/**
 * Options accepted by {@link filterByType}.
 *
 * @typedef {object} FbTypeOptions
 * @property {Rigor} [rigor=1] Type-detection precision level. See {@link Rigor}.
 * @property {number} [depth=Infinity] Nested traversal depth limit.
 * @property {boolean} [inPlace=false] Mutate the original container instead of
 *   cloning it.
 */

/**
 * Options accepted by {@link filterByValue}.
 *
 * @typedef {object} FbValOptions
 * @property {boolean} [cs=true] Case sensitivity for string comparison. Note
 *   that the current implementation applies its default with `||`, so passing
 *   `false` has no effect and matching is always case-sensitive.
 * @property {number} [depth=Infinity] Nested traversal depth limit.
 * @property {boolean} [inPlace=false] Mutate the original container instead of
 *   cloning it.
 */

/**
 * Instruction returned by a filter callback when a value is itself a container
 * and the loops should recurse into it rather than keep or drop it.
 *
 * @typedef {'descendInObj' | 'descendInArr'} WalkSignal
 */

/**
 * What a filter callback may answer for a single value.
 *
 * - `true` — remove this value.
 * - `false` — keep this value.
 * - a {@link WalkSignal} — keep it and recurse into it.
 *
 * @typedef {boolean | WalkSignal} FilterVerdict
 */

/**
 * Per-value predicate supplied by a filter and invoked by the looping helpers.
 *
 * @callback FilterPredicate
 * @param {string | undefined} key Property name when walking an object;
 *   `undefined` when walking an array.
 * @param {*} value The value under inspection.
 * @param {*} currentInput The single criterion being applied on this pass — a
 *   {@link CanonicalType} for `fbType`, a target value for `fbVal`.
 * @returns {FilterVerdict} Whether to drop, keep, or descend.
 */

export {};
