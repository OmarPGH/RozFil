import assert from 'node:assert';
import { objUtils } from '../src/index.js';

const { fbType, fbExType, fbTypeSmart, fbVal, fbIncludeVal, fbValfk } = objUtils;

let passed = 0, failed = 0;
function t(name, fn) {
	try { fn(); passed++; }
	catch (e) { failed++; console.log('FAIL:', name); console.log('     ', e.message); }
}

// Fresh fixture per test. Values span every relevant JS type + stringified forms.
// Tests use inPlace=true so functions/symbols (not structuredClone-able) are fine.
const flat = () => ({
	s: 'hello', es: '', sp: '   ',
	n: 1, ns: '2', nan: NaN, inf: Infinity, infs: 'Infinity',
	b: true, bs: 'true', bf: false,
	nul: null, nuls: 'null', u: undefined,
	big: 10n, sym: Symbol('x'), fn: () => 1,
	arr: ['JS'], earr: [], obj: { a: 1 }, eobj: {},
	d: new Date('2020-01-01'), ds: '2020-01-01',
	arrs: '[]', objs: '{}', num3: '123',
});

// ---- fbType (raw typeof on value) ----
t('fbType number removes 1/NaN/Infinity, keeps string & bigint', () => {
	const r = fbType(true, flat(), 'number');
	assert.ok(!('n' in r) && !('nan' in r) && !('inf' in r));
	assert.ok('ns' in r && 'big' in r);
});
t('fbType shorthand num works', () => {
	const r = fbType(true, flat(), 'num');
	assert.ok(!('n' in r));
});
t('fbType invalid token throws Type Error', () => {
	assert.throws(() => fbType(true, flat(), 'foo'), /Type Error/);
});
t('fbType more tokens than allowed throws', () => {
	assert.throws(
		() => fbType(true, flat(), 'string', 'number', 'boolean', 'function', 'object', 'bigint', 'symbol', 'undefined'),
		/Types is more than 7/,
	);
});

// ---- fbExType (precise type on value) ----
t('fbExType NaN removes only NaN, keeps number 1', () => {
	const r = fbExType(true, flat(), 'NaN');
	assert.ok(!('nan' in r) && 'n' in r);
});
t('fbExType array removes arrays, keeps objects', () => {
	const r = fbExType(true, flat(), 'array');
	assert.ok(!('arr' in r) && !('earr' in r) && 'obj' in r);
});
t('fbExType object removes plain objects & Date, keeps arrays & null', () => {
	const r = fbExType(true, flat(), 'object');
	assert.ok(!('obj' in r) && !('eobj' in r) && !('d' in r));
	assert.ok('arr' in r && 'nul' in r);
});
t('fbExType date matches parseable string, NOT Date instance', () => {
	const r = fbExType(true, flat(), 'date');
	assert.ok(!('ds' in r) && 'd' in r);
});

// ---- fbTypeSmart (type + stringified detection on value) ----
t('fbTypeSmart number removes 1, "2", "123"', () => {
	const r = fbTypeSmart(true, flat(), 'number');
	assert.ok(!('n' in r) && !('ns' in r) && !('num3' in r) && 's' in r);
});
t('fbTypeSmart array removes [], ["JS"] and "[]"', () => {
	const r = fbTypeSmart(true, flat(), 'array');
	assert.ok(!('arr' in r) && !('earr' in r) && !('arrs' in r));
});
t('fbTypeSmart emptyObject removes {} only', () => {
	const r = fbTypeSmart(true, flat(), 'emptyObject');
	assert.ok(!('eobj' in r) && 'obj' in r && 'objs' in r);
});

// ---- fbVal (value equality) ----
t('fbVal cs=false matches HELLO~hello', () => {
	const r = fbVal(true, false, flat(), 'HELLO');
	assert.ok(!('s' in r));
});
t('fbVal coerces number value: "1" removes 1', () => {
	const r = fbVal(true, false, flat(), '1');
	assert.ok(!('n' in r));
});
t('fbVal cs=true exact match', () => {
	const r = fbVal(true, true, flat(), 'hello');
	assert.ok(!('s' in r));
});

// ---- fbIncludeVal (value inclusion) ----
t('fbIncludeVal substring in string value', () => {
	const r = fbIncludeVal(true, false, flat(), 'ell');
	assert.ok(!('s' in r));
});
t('fbIncludeVal element inside array value', () => {
	const r = fbIncludeVal(true, false, flat(), 'js');
	assert.ok(!('arr' in r));
});

// ---- cross-cutting ----
t('empty top-level object throws', () => {
	assert.throws(() => fbVal(true, false, {}, 'x'), /object length is less than 1/);
});
t('non-object throws', () => {
	assert.throws(() => fbVal(true, false, 5, 'x'), /this isn't object/);
});
t('no input tokens returns object unchanged', () => {
	const r = fbVal(true, false, { a: 1 });
	assert.deepStrictEqual(r, { a: 1 });
});
t('non-boolean inPlace throws', () => {
	assert.throws(() => fbVal('x', false, { a: 1 }, '1'), /inPlace/);
});
t('non-boolean cs throws', () => {
	assert.throws(() => fbVal(true, 'x', { a: 1 }, '1'), /Case sensitivity/);
});
t('inPlace=false clones: original untouched, new object returned', () => {
	const src = { a: 1, b: 2 };
	const r = fbVal(false, true, src, '1');
	assert.ok(!('a' in r) && 'a' in src && r !== src);
});
t('type filters do NOT hit the translate ReferenceError (allowed=undefined)', () => {
	assert.doesNotThrow(() => fbType(true, { a: 1 }, 'number'));
	assert.doesNotThrow(() => fbExType(true, { a: 1 }, 'number'));
	assert.doesNotThrow(() => fbTypeSmart(true, { a: 1 }, 'number'));
});
t('regression: fbValfk still filters by key name', () => {
	const r = fbValfk(true, true, { user: 1, skills: 2 }, 'user');
	assert.ok(!('user' in r) && 'skills' in r);
});

console.log(`\nobjUtils VALUE filters: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
