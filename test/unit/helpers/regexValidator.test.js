import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bigintRe, emptyStringWithSpacesRe } from '../../../src/helpers/regexValidator.js';

describe('bigintRe', () => {
	it('matches a positive bigint-style string', () => {
		assert.equal(bigintRe.test('123n'), true);
	});

	it('matches a negative bigint-style string', () => {
		assert.equal(bigintRe.test('-123n'), true);
	});

	it('does not match a plain number string', () => {
		assert.equal(bigintRe.test('123'), false);
	});

	it('does not match a decimal number with trailing n', () => {
		assert.equal(bigintRe.test('1.5n'), false);
	});

	it('does not match an empty string', () => {
		assert.equal(bigintRe.test(''), false);
	});
});

describe('emptyStringWithSpacesRe', () => {
	it('matches a string of only spaces', () => {
		assert.equal(emptyStringWithSpacesRe.test('   '), true);
	});

	it('matches a string of only tabs/newlines', () => {
		assert.equal(emptyStringWithSpacesRe.test('\t\n'), true);
	});

	it('does not match a fully empty string', () => {
		// requires at least one whitespace char (+, not *)
		assert.equal(emptyStringWithSpacesRe.test(''), false);
	});

	it('does not match a string with visible characters', () => {
		assert.equal(emptyStringWithSpacesRe.test(' a '), false);
	});
});
