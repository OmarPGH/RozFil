import { coreFilterEngine } from './coreFilterEngine.js';

function filterByType(arr, ...input) {
	let allowed = ['string', 'number', 'boolean', 'function', 'object', 'bigint', 'symbol'];
	function filterFun(ele, currentInput){

		if (currentInput === typeof ele) {
			return true;
		}

		return false;

	}
	return coreFilterEngine(filterFun, arr, input, allowed);
}

export { filterByType };