import { filterEngineRouter, isWalkable } from '../helpers/index.js';

function filterByValue(ele, input, options = {}) {
	const cs = options.cs ?? true;
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) param must be boolean');
	const allowed = undefined;
	function filterFun(key, value, currentInput){

		let isWalkableRes = isWalkable(value);
		if (isWalkableRes) return isWalkableRes;

		
		if (cs === true) {

			if (currentInput === value) return true;

		} else if (cs === false) {

			value = String(value);
			currentInput = String(currentInput);
			
			if (currentInput.toLowerCase() === value.toLowerCase()) return true;

		}

		return false;

	}

	return filterEngineRouter(ele, input, options, filterFun, allowed);
}

export { filterByValue }