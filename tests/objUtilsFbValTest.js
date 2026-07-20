import assert from 'node:assert';
import { objUtils } from '../src/index.js';

const { fbVal, fbValfk } = objUtils;

let passed = 0, failed = 0;
function t(name, fn) {
	try { fn(); passed++; }
	catch (e) { failed++; console.log('FAIL:', name); console.log('     ', e.message); }
}

// fbVal: exclude entries whose VALUE matches
t('cs=false matches case-insensitively (HELLO ~ hello)', () => {
	const r = fbVal(true, false, { a: 'hello', b: 'world' }, 'HELLO');
	assert.ok(!('a' in r) && 'b' in r);
});
t('cs=true matches exactly only', () => {
	const r = fbVal(true, true, { a: 'hello', b: 'HELLO' }, 'hello');
	assert.ok(!('a' in r) && 'b' in r);
});
t('coerces values with String() ("1" removes numeric 1)', () => {
	const r = fbVal(true, false, { a: 1, b: 2 }, '1');
	assert.ok(!('a' in r) && 'b' in r);
});
t('multiple inputs remove multiple entries', () => {
	const r = fbVal(true, true, { a: 'x', b: 'y', c: 'z' }, 'x', 'z');
	assert.ok(!('a' in r) && !('c' in r) && 'b' in r);
});
t('inPlace=false clones: original untouched, new object returned', () => {
	const src = { a: '1', b: '2' };
	const r = fbVal(false, true, src, '1');
	assert.ok(!('a' in r) && 'a' in src && r !== src);
});
t('inPlace=true mutates the original', () => {
	const src = { a: '1', b: '2' };
	const r = fbVal(true, true, src, '1');
	assert.ok(r === src && !('a' in src));
});
t('empty top-level object throws', () => {
	assert.throws(() => fbVal(true, false, {}, 'x'), /object length is less than 1/);
});
t('non-object throws', () => {
	assert.throws(() => fbVal(true, false, 5, 'x'), /this isn't array|this isn't object/);
});
t('non-boolean inPlace throws', () => {
	assert.throws(() => fbVal('x', false, { a: 1 }, '1'), /inPlace/);
});
t('non-boolean cs throws', () => {
	assert.throws(() => fbVal(true, 'x', { a: 1 }, '1'), /Case sensitivity/);
});
t('no input tokens returns object unchanged', () => {
	const r = fbVal(true, false, { a: 1 });
	assert.deepStrictEqual(r, { a: 1 });
});
t('regression: fbValfk still works via keyFilters path', () => {
	const r = fbValfk(true, true, { user: 1, skills: 2 }, 'user');
	assert.ok(!('user' in r) && 'skills' in r);
});

console.log(`\nobjUtils fbVal: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
