import assert from 'node:assert';
import { objUtils } from '../src/index.js';

const { fbTypeDeep, fbExTypeDeep, fbTypeSmartDeep, fbValDeep, fbIncludeValDeep } = objUtils;

let passed = 0, failed = 0;
function t(name, fn) {
	try { fn(); passed++; }
	catch (e) { failed++; console.log('FAIL:', name); console.log('     ', e.message); }
}

// ---- recursion into nested objects ----
t('removes matching values at every nesting level in one call', () => {
	const o = { n1: 1, sub: { n2: 2, sub2: { n3: 3, s: 'x' } } };
	const r = fbTypeDeep(true, o, 'number');
	assert.ok(!('n1' in r) && !('n2' in r.sub) && !('n3' in r.sub.sub2) && 's' in r.sub.sub2);
});
t('deleted subtree is not recursed into (no error, subtree gone)', () => {
	const o = { target: { deep: 1 }, keep: 5 };
	const r = fbExTypeDeep(true, o, 'object');
	assert.ok(!('target' in r) && 'keep' in r);
});
t('array-wrapped object is NOT descended (documents scope)', () => {
	const o = { arr: [{ inner: 1 }] };
	const r = fbTypeDeep(true, o, 'number');
	assert.ok(Array.isArray(r.arr) && r.arr[0].inner === 1);
});
t('cyclic object completes without hanging', () => {
	const o = { a: 1 };
	o.self = o;
	const r = fbTypeDeep(true, o, 'number');
	assert.ok(!('a' in r) && r.self === r);
});
t('empty nested object neither throws nor breaks traversal', () => {
	const o = { e: {}, n: 1 };
	const r = fbTypeDeep(true, o, 'number');
	assert.ok(!('n' in r) && 'e' in r && Object.keys(r.e).length === 0);
});

// ---- inPlace semantics through nesting ----
t('inPlace=true mutates original and nested objects (identity preserved)', () => {
	const o = { sub: { n: 1, k: 2 } };
	const sub = o.sub;
	const r = fbTypeDeep(true, o, 'number');
	assert.ok(r === o && r.sub === sub && !('n' in sub) && !('k' in sub));
});
t('inPlace=false returns independent deep copy, original untouched', () => {
	const o = { sub: { n: 1 } };
	const r = fbTypeDeep(false, o, 'number');
	assert.ok(r !== o && o.sub.n === 1 && !('n' in r.sub));
});

// ---- each deep filter kind ----
t('fbValDeep removes equal values at all levels', () => {
	const o = { a: 'x', sub: { a: 'x', b: 'y' } };
	const r = fbValDeep(true, false, o, 'X');
	assert.ok(!('a' in r) && !('a' in r.sub) && 'b' in r.sub);
});
t('fbIncludeValDeep removes substring matches at all levels', () => {
	const o = { s: 'hello', sub: { s2: 'help' } };
	const r = fbIncludeValDeep(true, false, o, 'hel');
	assert.ok(!('s' in r) && !('s2' in r.sub));
});
t('fbExTypeDeep date matches string not Date, at all levels', () => {
	const o = { ds: '2020-01-01', d: new Date('2020-01-01'), sub: { ds2: '2021-05-05' } };
	const r = fbExTypeDeep(true, o, 'date');
	assert.ok(!('ds' in r) && 'd' in r && !('ds2' in r.sub));
});
t('fbTypeSmartDeep array removes arrays and stringified arrays', () => {
	const o = { arrs: '[]', sub: { a: ['x'], n: '5' } };
	const r = fbTypeSmartDeep(true, o, 'array');
	assert.ok(!('arrs' in r) && !('a' in r.sub) && 'n' in r.sub);
});

// ---- cross-cutting ----
t('deep empty top-level object throws', () => {
	assert.throws(() => fbTypeDeep(true, {}, 'number'), /object length is less than 1/);
});
t('deep no input tokens returns object unchanged', () => {
	const r = fbValDeep(true, false, { a: 1, sub: { b: 2 } });
	assert.deepStrictEqual(r, { a: 1, sub: { b: 2 } });
});
t('deep non-boolean inPlace throws', () => {
	assert.throws(() => fbTypeDeep('x', { a: 1 }, 'number'), /inPlace/);
});

console.log(`\nobjUtils DEEP filters: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
