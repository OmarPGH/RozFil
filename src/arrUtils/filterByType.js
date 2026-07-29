import { filterEngine } from './filterEngine.js';

function filterByType(arr, input, options) {
	let allowed = ['string', 'number', 'boolean', 'function', 'object', 'bigint', 'symbol'];
	function filterFun(ele, currentInput){

		if (currentInput === typeof ele) {
			return true;
		}

		return false;

	}
	return filterEngine(arr, input, options.inPlace, options.depth, filterFun, allowed);
}

export { filterByType };