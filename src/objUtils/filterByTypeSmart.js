import { coreFilterEngine } from './coreFilterEngine.js';
import { resolveTypeTokens } from './typeTokens.js';
import * as reBook from './regexBook.js';

const SMART_ALLOWED = ['string', 'number', 'boolean', 'undefined', 'function', 'null', 'array', 'object', 'NaN', 'bigint', 'Infinity', 'symbol', 'true', 'false', 'emptyString', 'emptyStringWithSpaces', 'emptyStringOrWithSpaces', 'emptyArray', 'emptyObject', 'date'];

function makeTypeSmartPredicate() {
	return function filterFun(key, value, currentInput) {

		let valueType = typeof value;
		let valueTrim;

		valueType === 'string' ? valueTrim = value.trim() : 'Not String';

		if (currentInput === 'string' && valueType === 'string' && !reBook.jsonObjArrRe.test(value)) {
			return true;
		}

		if (currentInput === 'number' && (valueType === 'number' && !Number.isNaN(value) && value !== Infinity || reBook.numberRe.test(valueTrim))) {
			return true;
		}

		if (currentInput === 'boolean' && (valueType === 'boolean' || valueTrim === 'true' || valueTrim === 'false')) {
			return true;
		}

		if (currentInput === 'undefined' && (valueType === 'undefined' || valueTrim === 'undefined')) {
			return true;
		}

		if (currentInput === 'function' && valueType === 'function') {
			return true;
		}

		if (currentInput === 'null' && (value === null || valueTrim === 'null')) {
			return true;
		}

		if (currentInput === 'array' && (Array.isArray(value) || reBook.arrRe.test(valueTrim))) {
			return true;
		}

		if (currentInput === 'object' && (valueType === 'object' && value !== null && !Array.isArray(value) || reBook.objectRe.test(valueTrim))) {
			return true;
		}

		if (currentInput === 'NaN' && (Number.isNaN(value) || valueTrim === 'NaN')) {
			return true;
		}

		if (currentInput === 'bigint' && (valueType === 'bigint' || reBook.bigintRe.test(valueTrim))) {
			return true;
		}

		if (currentInput === 'Infinity' && (value === Infinity || valueTrim === 'Infinity')) {
			return true;
		}

		if (currentInput === 'symbol' && valueType === 'symbol') {
			return true;
		}

		if (currentInput === 'true' && (value === true || valueTrim === 'true')) {
			return true;
		}

		if (currentInput === 'false' && (value === false || valueTrim === 'false')) {
			return true;
		}

		if (currentInput === 'emptyString' && value === '') {
			return true;
		}

		if (currentInput === 'emptyStringWithSpaces' && valueType === 'string' && reBook.emptyStringWithSpacesRe.test(value)) {
			return true;
		}

		if (currentInput === 'emptyStringOrWithSpaces' && valueTrim === '') {
			return true;
		}

		if (currentInput === 'emptyArray' && Array.isArray(value) && value.length === 0) {
			return true;
		}

		if (currentInput === 'emptyObject' && valueType === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0) {
			return true;
		}

		if (currentInput === 'date' && valueType === 'string' && !Number.isNaN(Date.parse(value))) {
			return true;
		}

		return false;

	};
}

function filterByTypeSmart(inPlace, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	input = resolveTypeTokens(input, SMART_ALLOWED);
	return coreFilterEngine(makeTypeSmartPredicate(), inPlace, obj, input, undefined, true);
}

export { filterByTypeSmart, makeTypeSmartPredicate, SMART_ALLOWED };
