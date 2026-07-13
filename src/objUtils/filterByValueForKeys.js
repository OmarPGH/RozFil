import { coreFilterEngine } from './coreFilterEngine.js';

function filterByValueForKeys(inPlace, cs, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (CS) must be boolean');
	let allowed = undefined;
	let iterate = !cs;
	function filterFun(key, value, currentInput){

		key = String(key);
		currentInput = String(currentInput);
		
		if (cs === false) {

			if (currentInput.toLowerCase() === key.toLowerCase()) {
				return true;
			}

		} else if (cs === true) {

			if (currentInput === key) {
				return true;
			}

		}

		return false;

	}
	return coreFilterEngine(filterFun, inPlace, obj, input, allowed, iterate);
}

export { filterByValueForKeys }