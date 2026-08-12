import { filterEngineRouter, isWalkable, reBook } from '../shared/index.js';

function filterByType(ele, input, options = {}) {

	const rigor = options.rigor || 1;
	if (rigor < 1 || rigor > 3) throw new Error("Rigor must be 1/2/3")
	
	let allowed;
	
	if (rigor === 1) {
		allowed = ['string', 'number', 'boolean', 'function', 'object', 'bigint', 'symbol'];
	} else if (rigor === 2 || rigor === 3) {
		allowed = ['string', 'number', 'boolean', 'undefined', 'function', 'null', 'array', 'object', 'NaN', 'bigint', 'Infinity', 'symbol', 'true', 'false', 'emptyString', 'emptyStringWithSpaces', 'emptyStringOrWithSpaces', 'emptyObject', 'emptyArray', 'date'];
	}

	function filterFun(key, value, currentInput){

		const valueType = typeof value;
		let valueTrim;

		valueType === 'string' ? valueTrim = value.trim() : 'Not String';

		function rigorOne() {
			if (currentInput === typeof value) {
				return true;
			}
		}

		function rigorTwo() {
			
			if (currentInput === 'string' && valueType === 'string') {
				return true;
			} 

			if (currentInput === 'number' && valueType === 'number' && !Number.isNaN(value) && value !== Infinity) {
				return true;
			} 

			if (currentInput === 'boolean' && valueType === 'boolean') {
				return true;
			} 

			if (currentInput === 'undefined' && valueType === 'undefined') {
				return true;
			} 

			if (currentInput === 'function' && valueType === 'function') {
				return true;
			} 

			if (currentInput === 'null' && value === null) {
				return true;
			} 

			if (currentInput === 'array' && Array.isArray(value)) {
				return true;
			} 

			if (currentInput === 'object' && valueType === 'object' && value !== null && !Array.isArray(value)) {
				return true;
			}

			if (currentInput === 'NaN' && Number.isNaN(value)) {
				return true;
			}

			if (currentInput === 'bigint' && valueType === 'bigint') {
				return true;
			}

			if (currentInput === 'Infinity' && value === Infinity) {
				return true;
			}

			if (currentInput === 'symbol' && valueType === 'symbol') {
				return true;
			}

			if (currentInput === 'true' && value === true) {
				return true;
			}

			if (currentInput === 'false' && value === false) {
				return true;
			}

			if (currentInput === 'date' && valueType === 'string' && !Number.isNaN(Date.parse(value))) {
				return true;
			}

		}

		function rigorThree() {
			
			if (currentInput === 'string' && valueType === 'string' && !reBook.jsonObjArrRe.test(value)) {
				return true;
			} 
			
			if (currentInput === 'number' && (valueType === 'number' && !Number.isNaN(value) && value !== Infinity || reBook.numberRe.test(valueTrim))) {
				return true;
			} 

			if (currentInput === 'boolean' && (valueType === 'boolean' || valueTrim === 'true' || valueTrim === 'false')) {
				return true;
			} 

			if (currentInput === 'undefined' && (valueType === 'undefined' || valueTrim === 'undefined')) {
				return true;
			} 

			if (currentInput === 'function' && valueType === 'function') {
				return true;
			} 

			if (currentInput === 'null' && (value === null || valueTrim === 'null')) {
				return true;
			} 

			if (currentInput === 'array' && (Array.isArray(value) || reBook.arrRe.test(valueTrim))) {
				return true;
			} 

			if (currentInput === 'object' && (valueType === 'object' && value !== null && !Array.isArray(value) || reBook.objectRe.test(valueTrim))) {
				return true;
			}

			if (currentInput === 'NaN' && (Number.isNaN(value) || valueTrim === 'NaN')) {
				return true;
			}

			if (currentInput === 'bigint' && (valueType === 'bigint' || reBook.bigintRe.test(valueTrim))) {
				return true;
			}

			if (currentInput === 'Infinity' && (value === Infinity || valueTrim === 'Infinity')) {
				return true;
			}

			if (currentInput === 'symbol' && valueType === 'symbol') {
				return true;
			}

			if (currentInput === 'true' && (value === true || valueTrim === 'true')) {
				return true;
			}

			if (currentInput === 'false' && (value === false || valueTrim === 'false')) {
				return true;
			}

			if (currentInput === 'emptyString' && value === '') {
				return true;
			}

			if (currentInput === 'emptyStringWithSpaces' && valueType === 'string' && reBook.emptyStringWithSpacesRe.test(value)) {
				return true;
			}

			if (currentInput === 'emptyStringOrWithSpaces' && valueTrim === '') {
				return true;
			}

			if (currentInput === 'emptyArray' && Array.isArray(value) && value.length === 0) {
				return true;
			}

			if (currentInput === 'emptyObject' && valueType === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0) {
				return true;
			}

			if (currentInput === 'date' && valueType === 'string' && !Number.isNaN(Date.parse(value))) {
				return true;
			}

		}

		if (rigor === 1) {
			if (rigorOne()) return true;
		} else if (rigor === 2) {
			if (rigorTwo()) return true;
		} else if (rigor === 3) {
			if (rigorThree()) return true;
		}

		let isWalkableRes = isWalkable(value);
		if (isWalkableRes) return isWalkableRes;

		return false;

	}
	
	return filterEngineRouter(ele, input, options, filterFun, allowed);
}

export { filterByType };