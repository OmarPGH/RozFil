import { coreFilterEngine } from './coreFilterEngine.js';
import { resolveTypeTokens } from './typeTokens.js';

const EXTYPE_ALLOWED = ['string', 'number', 'boolean', 'undefined', 'function', 'null', 'array', 'object', 'NaN', 'bigint', 'Infinity', 'symbol', 'true', 'false', 'date'];

function makeExactTypePredicate() {
	return function filterFun(key, value, currentInput) {

		let valueType = typeof value;

		if (currentInput === 'string' && valueType === 'string') {
			return true;
		}

		if (currentInput === 'number' && valueType === 'number' && !Number.isNaN(value) && value !== Infinity) {
			return true;
		}

		if (currentInput === 'boolean' && valueType === 'boolean') {
			return true;
		}

		if (currentInput === 'undefined' && valueType === 'undefined') {
			return true;
		}

		if (currentInput === 'function' && valueType === 'function') {
			return true;
		}

		if (currentInput === 'null' && value === null) {
			return true;
		}

		if (currentInput === 'array' && Array.isArray(value)) {
			return true;
		}

		if (currentInput === 'object' && valueType === 'object' && value !== null && !Array.isArray(value)) {
			return true;
		}

		if (currentInput === 'NaN' && Number.isNaN(value)) {
			return true;
		}

		if (currentInput === 'bigint' && valueType === 'bigint') {
			return true;
		}

		if (currentInput === 'Infinity' && value === Infinity) {
			return true;
		}

		if (currentInput === 'symbol' && valueType === 'symbol') {
			return true;
		}

		if (currentInput === 'true' && value === true) {
			return true;
		}

		if (currentInput === 'false' && value === false) {
			return true;
		}

		if (currentInput === 'date' && valueType === 'string' && !Number.isNaN(Date.parse(value))) {
			return true;
		}

		return false;

	};
}

function filterByExactType(inPlace, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	input = resolveTypeTokens(input, EXTYPE_ALLOWED);
	return coreFilterEngine(makeExactTypePredicate(), inPlace, obj, input, undefined, true);
}

export { filterByExactType, makeExactTypePredicate, EXTYPE_ALLOWED };
