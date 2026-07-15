import { coreFilterEngine } from './coreFilterEngine.js';

function filterByType(inPlace, arr, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
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