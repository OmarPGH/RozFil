import test from 'node:test';
import assert from 'node:assert/strict';
import { isJsonObjectOrArray } from '../src/helpers/jsonValidator.js';

test('accepts valid JSON objects and arrays', () => {
  assert.equal(isJsonObjectOrArray('{"name":"RozFil"}'), true);
  assert.equal(isJsonObjectOrArray('[1,2,3]'), true);
  assert.equal(isJsonObjectOrArray('  {"nested":{"ok":true}}  '), true);
});

test('rejects JSON primitives', () => {
  assert.equal(isJsonObjectOrArray('123'), false);
  assert.equal(isJsonObjectOrArray('true'), false);
  assert.equal(isJsonObjectOrArray('null'), false);
  assert.equal(isJsonObjectOrArray('"text"'), false);
});

test('rejects malformed JSON', () => {
  assert.equal(isJsonObjectOrArray('{name:"RozFil"}'), false);
  assert.equal(isJsonObjectOrArray('[1,2,]'), false);
  assert.equal(isJsonObjectOrArray('{'), false);
});

test('rejects non-string values', () => {
  assert.equal(isJsonObjectOrArray({}), false);
  assert.equal(isJsonObjectOrArray([]), false);
  assert.equal(isJsonObjectOrArray(null), false);
});

test('handles large ReDoS-style input without regex backtracking', () => {
  const input = '{' + ' '.repeat(50000);
  assert.equal(isJsonObjectOrArray(input), false);
});
