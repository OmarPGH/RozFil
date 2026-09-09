import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fbType, fbVal } from '../../src/index.js';

// These tests are NOT about correctness (that's covered elsewhere) -- they're about
// finding where the library actually breaks under real-world scale: very wide
// collections, very deep nesting, and memory behavior. Numbers here depend on the
// V8 engine/Node version running the tests, so exact thresholds may shift slightly
// across machines -- what matters is that the *shape* of the failure (RangeError from
// stack depth, not a hang or silent data corruption) stays consistent.

function buildNestedArray(depth, leafValue = ['leaf-string', 1]) {
	// built iteratively (not recursively) so that constructing the test fixture
	// itself never hits a stack limit -- only the library's own recursive
	// looping should be what triggers RangeError in these tests
	let result = leafValue;
	for (let i = 0; i < depth; i++) {
		result = [result];
	}
	return result;
}

function buildNestedObject(depth) {
	// same reasoning as buildNestedArray: iterative construction so the fixture
	// itself can go arbitrarily deep without throwing
	let result = { leaf: 'str', num: 1 };
	for (let i = 0; i < depth; i++) {
		result = { nested: result };
	}
	return result;
}

describe('stress - wide arrays (many siblings, shallow depth)', () => {
	it('handles 100,000 elements without error and filters correctly', () => {
		const arr = [];
		for (let i = 0; i < 100_000; i++) arr.push(i % 2 === 0 ? `str${i}` : i);

		const result = fbType(arr, ['string'], { rigor: 1 });
		assert.equal(result.length, 50_000);
		assert.ok(result.every((v) => typeof v === 'number'));
	});

	it('handles 1,000,000 elements and completes in reasonable time (<2s)', () => {
		const arr = [];
		for (let i = 0; i < 1_000_000; i++) arr.push(i % 2 === 0 ? `str${i}` : i);

		const start = Date.now();
		const result = fbType(arr, ['string'], { rigor: 1 });
		const elapsedMs = Date.now() - start;

		assert.equal(result.length, 500_000);
		assert.ok(elapsedMs < 2000, `expected under 2000ms, took ${elapsedMs}ms`);
	});

	it('scales roughly linearly, not quadratically, as width grows', () => {
		function timeFor(size) {
			const arr = [];
			for (let i = 0; i < size; i++) arr.push(i % 2 === 0 ? `str${i}` : i);
			const start = Date.now();
			fbType(arr, ['string'], { rigor: 1 });
			return Date.now() - start;
		}

		// warm up first so JIT compilation doesn't skew the first measurement
		timeFor(10_000);

		const small = Math.max(timeFor(50_000), 1); // avoid div-by-zero on very fast runs
		const large = Math.max(timeFor(500_000), 1);

		// 10x the data should not cost more than ~30x the time (generous margin
		// for measurement noise) -- true O(n^2) behavior would blow way past this
		assert.ok(
			large / small < 30,
			`time did not scale linearly: 50k=${small}ms, 500k=${large}ms (ratio ${(large / small).toFixed(1)}x)`
		);
	});
});

describe('stress - wide objects (many keys, shallow depth)', () => {
	it('handles an object with 100,000 keys without error', () => {
		const obj = {};
		for (let i = 0; i < 100_000; i++) obj[`key${i}`] = i % 2 === 0 ? `str${i}` : i;

		const result = fbType(obj, ['string'], { rigor: 1 });
		assert.equal(Object.keys(result).length, 50_000);
	});
});

describe('stress - deeply nested arrays (recursion limit)', () => {
	it('handles moderate nesting depth (1,000 levels) without error', () => {
		const nested = buildNestedArray(1000);
		assert.doesNotThrow(() => fbType(nested, ['string'], { rigor: 1, depth: Infinity, inPlace: true }));
	});

	it('handles 2,000 levels of nesting without error', () => {
		const nested = buildNestedArray(2000);
		assert.doesNotThrow(() => fbType(nested, ['string'], { rigor: 1, depth: Infinity, inPlace: true }));
	});

	it('DOCUMENTS a known limitation: very deep array nesting (10,000+ levels) hits a call-stack RangeError', () => {
		// The engine's recursive descent (loopingOnArray -> loopingOnArray) has no
		// tail-call optimization in V8, so sufficiently deep nesting will always hit
		// "Maximum call stack size exceeded" before it hits any data-correctness issue.
		// This is a genuine limitation of the current recursive implementation, not
		// a bug this test suite is trying to hide -- it's recorded here so it's a
		// known, tested characteristic instead of a surprise in production.
		// (Measured failure point under node --test is ~4,000-4,500 levels; 10,000
		// is used here for a comfortable safety margin so this test doesn't become
		// flaky if the exact threshold shifts slightly across Node/V8 versions.)
		const veryDeep = buildNestedArray(10_000);
		assert.throws(
			() => fbType(veryDeep, ['string'], { rigor: 1, depth: Infinity, inPlace: true }),
			/Maximum call stack size exceeded/
		);
	});

	it('the same recursion limit applies to fbVal, not just fbType (shared engine)', () => {
		const veryDeep = buildNestedArray(10_000, ['leaf', 1]);
		assert.throws(
			() => fbVal(veryDeep, ['leaf'], { inPlace: true }),
			/Maximum call stack size exceeded/
		);
	});
});

describe('stress - deeply nested objects (recursion limit)', () => {
	it('handles moderate object nesting (1,000 levels) without error', () => {
		const nested = buildNestedObject(1000);
		assert.doesNotThrow(() => fbType(nested, ['string'], { rigor: 1, depth: Infinity, inPlace: true }));
	});

	it('handles object nesting up to 2,000 levels without error', () => {
		const nested = buildNestedObject(2000);
		assert.doesNotThrow(() => fbType(nested, ['string'], { rigor: 1, depth: Infinity, inPlace: true }));
	});

	it('DOCUMENTS a known limitation: extreme object nesting (10,000+ levels) also hits a call-stack RangeError', () => {
		// Measured failure point under node --test is ~5,000-6,000 levels for objects
		// (similar order of magnitude to arrays, sometimes slightly lower depending on
		// per-frame overhead of loopingOnObject vs loopingOnArray). 10,000 gives a
		// comfortable safety margin here too.
		const veryDeep = buildNestedObject(10_000);
		assert.throws(
			() => fbType(veryDeep, ['string'], { rigor: 1, depth: Infinity, inPlace: true }),
			/Maximum call stack size exceeded/
		);
	});
});

describe('stress - the default clone (inPlace: false) fails BEFORE the recursion limit on deep data', () => {
	it('deep nesting hits structuredClone\'s own depth ceiling earlier than the library\'s own recursion limit', () => {
		// structuredClone has its own internal recursion, separate from this library's
		// looping logic, and hits its ceiling at a shallower depth. Without inPlace:true,
		// deep data fails at the *cloning* step with a clone-specific error message,
		// not at the filtering step with "Maximum call stack size exceeded". This
		// matters for anyone debugging a production RangeError: the fix is inPlace:true,
		// not "reduce nesting depth".
		const moderatelyDeep = buildNestedArray(4000);
		assert.throws(
			() => fbType(moderatelyDeep, ['string'], { rigor: 1, depth: Infinity }), // inPlace defaults to false
			/unable to clone your array/
		);
	});

	it('the same moderately-deep data succeeds fine with inPlace: true', () => {
		const moderatelyDeep = buildNestedArray(4000);
		assert.doesNotThrow(() =>
			fbType(moderatelyDeep, ['string'], { rigor: 1, depth: Infinity, inPlace: true })
		);
	});
});

describe('stress - memory behavior', () => {
	it('processing a large array does not balloon memory disproportionately', () => {
		const arr = [];
		for (let i = 0; i < 500_000; i++) arr.push(i % 2 === 0 ? `str${i}` : i);

		if (global.gc) global.gc();
		const before = process.memoryUsage().heapUsed;

		const result = fbType(arr, ['string'], { rigor: 1 });

		const after = process.memoryUsage().heapUsed;
		const deltaMB = (after - before) / 1024 / 1024;

		assert.equal(result.length, 250_000);
		// generous ceiling -- this isn't a precise leak detector, just a sanity check
		// that we're not doing something wildly wasteful (e.g. quadratic copying)
		assert.ok(deltaMB < 500, `heap grew by ${deltaMB.toFixed(1)}MB, expected under 500MB`);
	});

	it('repeated calls do not leak unbounded memory across iterations', () => {
		function makeArr() {
			const arr = [];
			for (let i = 0; i < 10_000; i++) arr.push(i % 2 === 0 ? `str${i}` : i);
			return arr;
		}

		if (global.gc) global.gc();
		const before = process.memoryUsage().heapUsed;

		for (let iteration = 0; iteration < 50; iteration++) {
			fbType(makeArr(), ['string'], { rigor: 1 });
		}

		if (global.gc) global.gc();
		const after = process.memoryUsage().heapUsed;
		const deltaMB = (after - before) / 1024 / 1024;

		// 50 iterations of a 10k array is 500k total elements processed -- if memory
		// isn't being released between calls, this delta will be large
		assert.ok(deltaMB < 200, `heap grew by ${deltaMB.toFixed(1)}MB after 50 iterations, expected under 200MB`);
	});
});

describe('stress - many distinct filter types in a single call', () => {
	it('handles the maximum allowed number of distinct types (19, at rigor 2) without degrading', () => {
		const allTypes = [
			'string', 'number', 'boolean', 'undefined', 'function',
			'null', 'array', 'object', 'NaN', 'bigint',
			'Infinity', 'symbol', 'true', 'false', 'emptyString',
			'emptyStringWithSpaces', 'emptyStringOrWithSpaces', 'emptyObject', 'emptyArray',
		];
		const arr = [];
		for (let i = 0; i < 10_000; i++) {
			arr.push(i % 2 === 0 ? `val${i}` : i);
		}

		const start = Date.now();
		const result = fbType(arr, allTypes, { rigor: 2 });
		const elapsedMs = Date.now() - start;

		// with this many types allowed, BOTH the strings ('string' matches) and the
		// numbers ('number' matches) get removed -- only values matching none of the
		// 19 types would remain, and every value here is either a string or a number
		assert.equal(result.length, 0);
		assert.ok(elapsedMs < 1000, `expected under 1000ms with 19 filter types, took ${elapsedMs}ms`);
	});
});
