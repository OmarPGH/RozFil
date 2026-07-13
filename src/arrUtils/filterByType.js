import { coreFilterEngine } from './coreFilterEngine.js';

function filterByType(inPlace, arr, ...input) {
	let allowed = ['string', 'number', 'boolean', 'function', 'object', 'bigint', 'symbol'];
	function filterFun(ele, currentInput){

		if (currentInput === typeof ele) {
			return true;
		}

		return false;

	}
	return coreFilterEngine(filterFun, inPlace, arr, input, allowed);
}

export { filterByType };