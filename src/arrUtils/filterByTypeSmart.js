import { coreFilterEngine } from './coreFilterEngine.js';
import * as reBook from './regexBook.js';

function filterByTypeSmart(arr, ...input) {
	let allowed = ['string', 'number', 'boolean', 'undefined', 'function', 'null', 'array', 'object', 'NaN', 'bigint', 'Infinity', 'symbol', 'true', 'false', 'emptyString', 'emptyStringWithSpaces', 'emptyStringOrWithSpaces', 'emptyArray', 'emptyObject', 'date'];
	function filterFun(ele, currentInput){
		
		let eleType = typeof ele;
		let eleTrim;

		eleType === 'string' ? eleTrim = ele.trim() : 'Not String';

		if (currentInput === 'string' && eleType === 'string' && !reBook.jsonObjArrRe.test(ele)) {
			return true;
		} 
		
		if (currentInput === 'number' && (eleType === 'number' && !Number.isNaN(ele) && ele !== Infinity || reBook.numberRe.test(eleTrim))) {
			return true;
		} 

		if (currentInput === 'boolean' && (eleType === 'boolean' || eleTrim === 'true' || eleTrim === 'false')) {
			return true;
		} 

		if (currentInput === 'undefined' && (eleType === 'undefined' || eleTrim === 'undefined')) {
			return true;
		} 

		if (currentInput === 'function' && eleType === 'function') {
			return true;
		} 

		if (currentInput === 'null' && (ele === null || eleTrim === 'null')) {
			return true;
		} 

		if (currentInput === 'array' && (Array.isArray(ele) || reBook.arrRe.test(eleTrim))) {
			return true;
		} 

		if (currentInput === 'object' && (eleType === 'object' && ele !== null && !Array.isArray(ele) || reBook.objectRe.test(eleTrim))) {
			return true;
		}

		if (currentInput === 'NaN' && (Number.isNaN(ele) || eleTrim === 'NaN')) {
			return true;
		}

		if (currentInput === 'bigint' && (eleType === 'bigint' || reBook.bigintRe.test(eleTrim))) {
			return true;
		}

		if (currentInput === 'Infinity' && (ele === Infinity || eleTrim === 'Infinity')) {
			return true;
		}

		if (currentInput === 'symbol' && eleType === 'symbol') {
			return true;
		}

		if (currentInput === 'true' && (ele === true || eleTrim === 'true')) {
			return true;
		}

		if (currentInput === 'false' && (ele === false || eleTrim === 'false')) {
			return true;
		}

		if (currentInput === 'emptyString' && ele === '') {
			return true;
		}

		if (currentInput === 'emptyStringWithSpaces' && eleType === 'string' && reBook.emptyStringWithSpacesRe.test(ele)) {
			return true;
		}

		if (currentInput === 'emptyStringOrWithSpaces' && eleTrim === '') {
			return true;
		}

		if (currentInput === 'emptyArray' && Array.isArray(ele) && ele.length === 0) {
			return true;
		}

		if (currentInput === 'emptyObject' && eleType === 'object' && ele !== null && !Array.isArray(ele) && Object.keys(ele).length === 0) {
			return true;
		}

		if (currentInput === 'date' && eleType === 'string' && !Number.isNaN(Date.parse(ele))) {
			return true;
		}

		return false;

	}
	return coreFilterEngine(filterFun, arr, input, allowed);
}

export { filterByTypeSmart };