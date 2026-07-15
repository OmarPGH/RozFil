import { coreFilterEngine } from './coreFilterEngine.js';

function filterByValueForValues(inPlace, cs, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) param must be boolean');
	let allowed = undefined;
	function filterFun(key, value, currentInput){

		value = String(value);
		currentInput = String(currentInput);
		
		if (cs === false) {

			if (currentInput.toLowerCase() === value.toLowerCase()) {
				return true;
			}

		} else if (cs === true) {

			if (currentInput === value) {
				return true;
			}

		}

		return false;

	}
	return coreFilterEngine(filterFun, inPlace, obj, input, allowed);
}

export { filterByValueForValues }