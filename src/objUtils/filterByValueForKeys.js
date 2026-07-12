import { coreFilterEngine } from './coreFilterEngine.js';

function filterByValueForKeys(cs, obj, ...input) {
	let allowed = undefined;
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

	let iterate = !cs;

	return coreFilterEngine(filterFun, obj, input, allowed, iterate);
}

export { filterByValueForKeys }