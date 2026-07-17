import { coreFilterEngine } from './coreFilterEngine.js';

function makeValueEqualityPredicate(cs) {
	return function filterFun(key, value, currentInput) {

		value = String(value);
		currentInput = String(currentInput);

		if (cs === false) {
			if (currentInput.toLowerCase() === value.toLowerCase()) return true;
		} else if (cs === true) {
			if (currentInput === value) return true;
		}

		return false;

	};
}

function filterByValue(inPlace, cs, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (CS) must be boolean');
	return coreFilterEngine(makeValueEqualityPredicate(cs), inPlace, obj, input, undefined, true);
}

export { filterByValue, makeValueEqualityPredicate };
