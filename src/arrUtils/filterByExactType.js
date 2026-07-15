import { coreFilterEngine } from './coreFilterEngine.js';

function filterByExactType(inPlace, arr, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	let allowed = ['string', 'number', 'boolean', 'undefined', 'function', 'null', 'array', 'object', 'NaN', 'bigint', 'Infinity', 'symbol', 'true', 'false', 'date'];
	function filterFun(ele, currentInput){

		let eleType = typeof ele;
		let eleTrim;

		eleType === 'string' ? eleTrim = ele.trim() : 'Not String';

		if (currentInput === 'string' && eleType === 'string') {
			return true;
		} 

		if (currentInput === 'number' && eleType === 'number' && !Number.isNaN(ele) && ele !== Infinity) {
			return true;
		} 

		if (currentInput === 'boolean' && eleType === 'boolean') {
			return true;
		} 

		if (currentInput === 'undefined' && eleType === 'undefined') {
			return true;
		} 

		if (currentInput === 'function' && eleType === 'function') {
			return true;
		} 

		if (currentInput === 'null' && ele === null) {
			return true;
		} 

		if (currentInput === 'array' && Array.isArray(ele)) {
			return true;
		} 

		if (currentInput === 'object' && eleType === 'object' && ele !== null && !Array.isArray(ele)) {
			return true;
		}

		if (currentInput === 'NaN' && Number.isNaN(ele)) {
			return true;
		}

		if (currentInput === 'bigint' && eleType === 'bigint') {
			return true;
		}

		if (currentInput === 'Infinity' && ele === Infinity) {
			return true;
		}

		if (currentInput === 'symbol' && eleType === 'symbol') {
			return true;
		}

		if (currentInput === 'true' && ele === true) {
			return true;
		}

		if (currentInput === 'false' && ele === false) {
			return true;
		}

		if (currentInput === 'date' && eleType === 'string' && !Number.isNaN(Date.parse(ele))) {
			return true;
		}

		return false;

	}
	return coreFilterEngine(filterFun, inPlace, arr, input, allowed);
}

export { filterByExactType };