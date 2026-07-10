import { coreFilterEngine } from './coreFilterEngine.js';

function filterByType(depth, obj, ...input) {
	let allowed = ['string', 'number', 'boolean', 'function', 'object', 'bigint', 'symbol'];
	function filterFun(value, currentInput){

		if (currentInput === typeof ele) {
			return true;
		}

		return false;

	}
	return coreFilterEngine(filterFun, depth, obj, input, allowed);
}

export { filterByType };