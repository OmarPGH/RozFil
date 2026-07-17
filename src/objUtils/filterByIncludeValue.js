import { coreFilterEngine } from './coreFilterEngine.js';

function makeIncludeValuePredicate(cs) {
	return function filterFun(key, value, currentInput) {

		const isString = typeof value === 'string';
		const isArray = Array.isArray(value);

		if (!isString && !isArray) {
			return false;
		}

		if (cs === false) {

			if (isString) {
				if (value.toLowerCase().includes(currentInput.toLowerCase())) return true;
			}

			if (isArray) {
				for (let i = 0; i < value.length; i++) {
					if (typeof value[i] === 'string' && value[i].toLowerCase() === currentInput.toLowerCase()) return true;
				}
			}

		} else if (cs === true) {

			if (value.includes(currentInput)) {
				return true;
			}

		}

		return false;

	};
}

function filterByIncludeValue(inPlace, cs, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (CS) must be boolean');
	return coreFilterEngine(makeIncludeValuePredicate(cs), inPlace, obj, input, undefined, true);
}

export { filterByIncludeValue, makeIncludeValuePredicate };
