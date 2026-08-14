/**
 * @file Minimal benchmarking harness.
 *
 * Zero dependencies, in keeping with the library itself. Timing uses
 * `process.hrtime.bigint()`, which is monotonic and nanosecond-resolution.
 *
 * Two details matter for trustworthy numbers:
 *
 * - **Setup is excluded from timing.** Most benchmarks here need fresh input
 *   each run, because `inPlace` mutates and a filtered array cannot be
 *   re-filtered meaningfully. Building that input is not what we are measuring.
 * - **The median is reported, not the mean.** A single GC pause or scheduler
 *   preemption skews a mean badly at these durations; the median shrugs it off.
 */

/**
 * @typedef {object} MeasureOptions
 * @property {() =>*} [setup] Builds fresh input, run outside the timed region.
 *   Its return value is passed to the measured function.
 * @property {number} [samples=9] Timed runs to collect. The median is reported.
 * @property {number} [warmup=3] Untimed runs first, to let the JIT settle.
 */

/**
 * @typedef {object} Measurement
 * @property {number} median Median duration in milliseconds.
 * @property {number} min Fastest run in milliseconds.
 * @property {number} max Slowest run in milliseconds.
 * @property {number[]} samples Every timed run, in milliseconds.
 */

/**
 * Times a function, excluding its setup.
 *
 * @param {(input: *) => *} fn Work to measure.
 * @param {MeasureOptions} [options] Sampling controls.
 * @returns {Measurement} Timing summary in milliseconds.
 */
export function measure(fn, options = {}) {
	const { setup, samples = 9, warmup = 3 } = options;

	for (let i = 0; i < warmup; i++) fn(setup ? setup() : undefined);

	/** @type {number[]} */
	const timings = [];

	for (let i = 0; i < samples; i++) {
		const input = setup ? setup() : undefined;

		const started = process.hrtime.bigint();
		fn(input);
		const elapsed = process.hrtime.bigint() - started;

		timings.push(Number(elapsed) / 1e6);
	}

	const sorted = [...timings].sort((a, b) => a - b);

	return {
		median: sorted[Math.floor(sorted.length / 2)],
		min: sorted[0],
		max: sorted[sorted.length - 1],
		samples: timings,
	};
}

/**
 * Runs a workload across doubling input sizes and reports how the cost grows.
 *
 * The ratio between consecutive doublings is what identifies the complexity
 * class: linear work doubles when the input doubles, so the ratio sits near 2.
 * Quadratic work quadruples, landing near 4. That single number is a far more
 * robust signal than any absolute timing, because it is immune to how fast the
 * host machine happens to be.
 *
 * @param {number[]} sizes Input sizes to sweep, each ideally double the last.
 * @param {(size: number) => *} setup Builds input of a given size.
 * @param {(input: *) => *} fn Work to measure.
 * @returns {{size: number, median: number, perElement: number, ratio: number|null}[]}
 *   One row per size. `ratio` compares against the previous row.
 */
export function sweep(sizes, setup, fn) {
	const rows = [];
	let previous = null;

	for (const size of sizes) {
		const { median } = measure(fn, { setup: () => setup(size) });

		rows.push({
			size,
			median,
			perElement: (median * 1e6) / size,
			ratio: previous === null ? null : median / previous,
		});

		previous = median;
	}

	return rows;
}

/**
 * Averages the doubling ratios, ignoring the first row which has no predecessor.
 *
 * @param {{ratio: number|null}[]} rows Output of {@link sweep}.
 * @returns {number} Mean growth factor per doubling.
 */
export function averageRatio(rows) {
	const ratios = rows.map((row) => row.ratio).filter((r) => r !== null);
	return ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
}

/**
 * How much the per-element cost drifts from the smallest input to the largest.
 *
 * This is a sharper complexity signal than the average doubling ratio. Truly
 * linear work costs the same per element at any size, so the drift sits near
 * 1.0 no matter how many sizes were swept. The doubling ratio, by contrast,
 * hovers deceptively close to 2 even when per-element cost is climbing
 * steadily — averaging hides a trend that the endpoints expose.
 *
 * @param {{perElement: number}[]} rows Output of {@link sweep}.
 * @returns {number} Ratio of last per-element cost to first.
 */
export function perElementDrift(rows) {
	return rows[rows.length - 1].perElement / rows[0].perElement;
}

/**
 * Threshold above which per-element drift is treated as super-linear.
 *
 * Generous enough to absorb cache-hierarchy effects and allocator noise across
 * a 32-fold size range, tight enough that a genuine trend cannot hide.
 */
const LINEAR_DRIFT_LIMIT = 1.5;

/**
 * Prints a sweep as a table, followed by a complexity characterisation.
 *
 * @param {string} title Heading for this sweep.
 * @param {{size: number, median: number, perElement: number, ratio: number|null}[]} rows
 *   Output of {@link sweep}.
 * @param {{expect?: 'linear' | 'observe', note?: string}} [options]
 *   `'linear'` asserts O(n) and contributes to the exit code. `'observe'`
 *   characterises the growth without passing judgement, for workloads whose
 *   cost is a property of the runtime rather than a claim being tested.
 * @returns {boolean} `true` when the sweep met expectations. Always `true` for
 *   `'observe'`.
 */
export function report(title, rows, options = {}) {
	const { expect = 'linear', note } = options;

	console.log(`\n${title}`);
	console.log('  elements        median      ns/element   vs previous');
	console.log('  ---------------------------------------------------');

	for (const row of rows) {
		console.log(
			`  ${String(row.size).padStart(9)}  ${row.median.toFixed(3).padStart(10)} ms  ` +
			`${row.perElement.toFixed(1).padStart(9)}  ` +
			`${row.ratio === null ? '        —' : (row.ratio.toFixed(2) + '×').padStart(9)}`
		);
	}

	const growth = averageRatio(rows);
	const drift = perElementDrift(rows);
	const linear = drift < LINEAR_DRIFT_LIMIT;

	console.log(`\n  growth per doubling:  ${growth.toFixed(2)}×`);
	console.log(
		`  per-element drift:    ${drift.toFixed(2)}×  ` +
		(expect === 'observe'
			? (linear ? '(flat — linear)' : '(climbing — super-linear)')
			: (linear ? '✓ consistent with O(n)' : '✗ SUPER-LINEAR'))
	);

	if (note) console.log(`  ${note}`);

	return expect === 'observe' ? true : linear;
}

/**
 * Prints a comparison of named variants measured at the same input size.
 *
 * @param {string} title Heading for the comparison.
 * @param {Record<string, number>} results Variant name to median milliseconds.
 * @returns {void}
 */
export function compare(title, results) {
	console.log(`\n${title}`);

	const entries = Object.entries(results);
	const fastest = Math.min(...entries.map(([, ms]) => ms));
	const width = Math.max(...entries.map(([name]) => name.length));

	for (const [name, ms] of entries) {
		const relative = ms / fastest;
		console.log(
			`  ${name.padEnd(width)}  ${ms.toFixed(3).padStart(9)} ms  ` +
			`${relative === 1 ? 'baseline' : relative.toFixed(2) + '× slower'}`
		);
	}
}
