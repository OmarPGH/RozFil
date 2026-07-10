import { coreFilterEngine } from './coreFilterEngine.js';

function filterByValue(cs, arr, ...input) {
	let allowed = undefined;
	function filterFun(ele, currentInput){

		ele = String(ele);
		currentInput = String(currentInput);

		if (currentInput === ele) {
			return true;
		}

		return false;

	}
	return coreFilterEngine(filterFun, arr, input, allowed);
}

export { filterByValue }