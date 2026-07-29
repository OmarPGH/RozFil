import { filterEngine } from './filterEngine.js';

function filterByValue(arr, input, options) {
	const cs = options.cs;
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) param must be boolean');
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
	return filterEngine(arr, input, options.inPlace, options.depth, filterFun, allowed);
}

export { filterByValue }