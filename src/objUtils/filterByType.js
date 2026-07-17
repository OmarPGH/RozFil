import { coreFilterEngine } from './coreFilterEngine.js';
import { resolveTypeTokens } from './typeTokens.js';

const TYPE_ALLOWED = ['string', 'number', 'boolean', 'function', 'object', 'bigint', 'symbol'];

function makeTypePredicate() {
	return function filterFun(key, value, currentInput) {
		if (currentInput === typeof value) {
			return true;
		}
		return false;
	};
}

function filterByType(inPlace, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	input = resolveTypeTokens(input, TYPE_ALLOWED);
	return coreFilterEngine(makeTypePredicate(), inPlace, obj, input, undefined, true);
}

export { filterByType, makeTypePredicate, TYPE_ALLOWED };
