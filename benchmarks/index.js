/**
 * @file Performance benchmarks for RozFil.
 *
 * Run with `npm run bench`.
 *
 * The headline claim under test is the README's "Fast Array Compaction:
 * Implements O(N) two-pointer write compaction". The sweeps below check that
 * empirically by doubling the input and watching the growth factor: linear
 * work lands near 2.00× per doubling, quadratic near 4.00×.
 *
 * Absolute timings are machine-specific and not worth comparing across hosts.
 * The growth factors and the relative comparisons are the durable signal.
 */

import { fbType, fbVal } from '../src/index.js';
import { isValidJSONObjectOrArray } from '../src/shared/jsonValidator.js';
import { measure, sweep, report, compare } from './harness.js';

/**
 * Input sizes for the scaling sweeps, each double the last.
 *
 * Starts at 25k rather than something smaller: below that, a single GC pause
 * is a large fraction of the run and the first row skews the whole sweep.
 */
const SIZES = [25000, 50000, 100000, 200000, 400000, 800000];

/** Tracks whether every complexity check held, for the exit code. */
const verdicts = [];

/**
 * Builds a flat array where every other element is a number.
 *
 * @param {number} size Element count.
 * @returns {any[]} Half numbers, half strings.
 */
function flatArray(size) {
	const data = new Array(size);
	for (let i = 0; i < size; i++) data[i] = i % 2 ? 'keep' : i;
	return data;
}

/**
 * Builds a flat object where every other property value is a number.
 *
 * @param {number} size Property count.
 * @returns {Record<string, any>} Half numbers, half strings.
 */
function flatObject(size) {
	/** @type {Record<string, any>} */
	const data = {};
	for (let i = 0; i < size; i++) data[`k${i}`] = i % 2 ? 'keep' : i;
	return data;
}

/**
 * Builds a nested array `depth` levels deep, holding `size` leaves in total.
 *
 * @param {number} size Total leaf count.
 * @param {number} depth Nesting levels.
 * @returns {any[]} Nested structure.
 */
function nestedArray(size, depth) {
	const perLevel = Math.max(1, Math.floor(size / depth));
	let node = [];

	for (let level = 0; level < depth; level++) {
		const leaves = new Array(perLevel);
		for (let i = 0; i < perLevel; i++) leaves[i] = i % 2 ? 'keep' : i;
		node = [...leaves, node];
	}

	return node;
}

console.log('RozFil benchmarks');
console.log(`node ${process.version} on ${process.platform} ${process.arch}`);
console.log('\nAbsolute timings are machine-specific. The growth factor per');
console.log('doubling is the number that matters — near 2.00× means O(n).');

// ---------------------------------------------------------------------------

verdicts.push(report(
	'fbType — array compaction, filtering in place (rigor 2, half removed)',
	sweep(SIZES, flatArray, (data) => fbType(data, ['num'], { rigor: 2, inPlace: true }))
));

verdicts.push(report(
	'fbType — array, cloning first (rigor 2, half removed)',
	sweep(SIZES, flatArray, (data) => fbType(data, ['num'], { rigor: 2 }))
));

verdicts.push(report(
	'fbType — object property deletion (rigor 2, half removed)',
	sweep(SIZES, flatObject, (data) => fbType(data, ['num'], { rigor: 2, inPlace: true })),
	{
		expect: 'observe',
		note: 'Objects are not arrays: repeated `delete` pushes V8 out of its fast\n' +
			'  shape representation into dictionary mode, so per-element cost climbs\n' +
			'  with size. The README\'s O(N) claim covers array compaction, which it\n' +
			'  meets — this row is measured for visibility, not as a regression.',
	}
));

verdicts.push(report(
	'fbVal — array, stringified value matching',
	sweep(SIZES, flatArray, (data) => fbVal(data, ['keep'], { inPlace: true }))
));

verdicts.push(report(
	'fbType — worst case for compaction: nothing matches, everything survives',
	sweep(SIZES, flatArray, (data) => fbType(data, ['bln'], { rigor: 2, inPlace: true }))
));

// ---------------------------------------------------------------------------

const CMP_SIZE = 100000;

compare(`rigor level cost, ${CMP_SIZE.toLocaleString()} elements, in place`, {
	'rigor 1 (typeof)': measure(
		(d) => fbType(d, ['num'], { rigor: 1, inPlace: true }),
		{ setup: () => flatArray(CMP_SIZE) }
	).median,
	'rigor 2 (strict natives)': measure(
		(d) => fbType(d, ['num'], { rigor: 2, inPlace: true }),
		{ setup: () => flatArray(CMP_SIZE) }
	).median,
	'rigor 3 (stringified)': measure(
		(d) => fbType(d, ['num'], { rigor: 3, inPlace: true }),
		{ setup: () => flatArray(CMP_SIZE) }
	).median,
});

compare(`cloning cost, ${CMP_SIZE.toLocaleString()} elements`, {
	'inPlace: true': measure(
		(d) => fbType(d, ['num'], { rigor: 2, inPlace: true }),
		{ setup: () => flatArray(CMP_SIZE) }
	).median,
	'inPlace: false (structuredClone)': measure(
		(d) => fbType(d, ['num'], { rigor: 2 }),
		{ setup: () => flatArray(CMP_SIZE) }
	).median,
});

compare(`criteria count, ${CMP_SIZE.toLocaleString()} elements — each is a full pass`, {
	'1 type': measure(
		(d) => fbType(d, ['num'], { rigor: 2, inPlace: true }),
		{ setup: () => flatArray(CMP_SIZE) }
	).median,
	'2 types': measure(
		(d) => fbType(d, ['num', 'bln'], { rigor: 2, inPlace: true }),
		{ setup: () => flatArray(CMP_SIZE) }
	).median,
	'4 types': measure(
		(d) => fbType(d, ['num', 'bln', 'uf', 'nl'], { rigor: 2, inPlace: true }),
		{ setup: () => flatArray(CMP_SIZE) }
	).median,
});

// Rigor 3 routes `str`, `arr` and `obj` through JSON.parse (issues #21, #33).
// Parsing is cheap; *failing* to parse is not, because throwing dominates. The
// opening-character fast path keeps that cost off strings which cannot be
// containers at all, which is the overwhelmingly common case.
compare(`rigor 3 container detection, ${CMP_SIZE.toLocaleString()} strings, obj`, {
	'plain text (fast path)': measure(
		(d) => fbType(d, ['obj'], { rigor: 3, inPlace: true }),
		{ setup: () => new Array(CMP_SIZE).fill('plain text here') }
	).median,
	'valid JSON (parses)': measure(
		(d) => fbType(d, ['obj'], { rigor: 3, inPlace: true }),
		{ setup: () => new Array(CMP_SIZE).fill('{"a":1}') }
	).median,
	'malformed braces (throws)': measure(
		(d) => fbType(d, ['obj'], { rigor: 3, inPlace: true }),
		{ setup: () => new Array(CMP_SIZE).fill('{a:1}') }
	).median,
});

compare(`traversal depth, ~${CMP_SIZE.toLocaleString()} leaves`, {
	'flat': measure(
		(d) => fbType(d, ['num'], { rigor: 2, inPlace: true }),
		{ setup: () => flatArray(CMP_SIZE) }
	).median,
	'nested 10 deep': measure(
		(d) => fbType(d, ['num'], { rigor: 2, inPlace: true }),
		{ setup: () => nestedArray(CMP_SIZE, 10) }
	).median,
	'nested 100 deep': measure(
		(d) => fbType(d, ['num'], { rigor: 2, inPlace: true }),
		{ setup: () => nestedArray(CMP_SIZE, 100) }
	).median,
});

// ---------------------------------------------------------------------------

console.log('\n\nReDoS regression guard — issue #21');
console.log('\nThe removed jsonObjArrRe pattern grew cubically on this input:');
console.log('  8,000 chars took 114,663 ms, and 50,000 would have run for hours.');

verdicts.push(report(
	'isValidJSONObjectOrArray — unterminated brace plus whitespace',
	sweep(
		[50000, 100000, 200000, 400000],
		(size) => '{' + ' '.repeat(size),
		(payload) => isValidJSONObjectOrArray(payload)
	)
));

// ---------------------------------------------------------------------------

const allLinear = verdicts.every(Boolean);

console.log('\n');

if (allLinear) {
	console.log('Every asserted sweep grew linearly — the README\'s O(N) array');
	console.log('compaction claim holds, and the ReDoS fix from #21 has not regressed.');
	console.log('\nObject property deletion is measured but not asserted: its cost per');
	console.log('element climbs with size for reasons that belong to V8 rather than');
	console.log('to RozFil. Prefer arrays when filtering very large collections.');
} else {
	console.log('At least one asserted sweep grew super-linearly — see the ✗ markers.');
}

process.exit(allLinear ? 0 : 1);
