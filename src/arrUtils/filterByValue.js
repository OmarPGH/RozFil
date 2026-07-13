import { coreFilterEngine } from './coreFilterEngine.js';

function filterByValue(inPlace, cs, arr, ...input) {
	let allowed = undefined;
	function filterFun(ele, currentInput){

		ele = String(ele);
		currentInput = String(currentInput);
		
		if (cs === false) {

			if (currentInput.toLowerCase() === ele.toLowerCase()) {
				return true;
			}

		} else if (cs === true) {

			if (currentInput === ele) {
				return true;
			}

		}

		return false;

	}
	return coreFilterEngine(filterFun, inPlace, arr, input, allowed);
}

export { filterByValue }