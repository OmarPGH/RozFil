import { filterEngineRouter, isWalkable } from '../shared/index.js';

function filterByValue(ele, input, options = {}) {
	const cs = options.cs || true;
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) param must be boolean');
	const allowed = undefined;
	function filterFun(key, value, currentInput){

		let isWalkableRes = isWalkable(value);
		if (isWalkableRes) return isWalkableRes;

		value = String(value);
		currentInput = String(currentInput);
		
		if (cs === false) {

			if (currentInput.toLowerCase() === value.toLowerCase()) return true;

		} else if (cs === true) {

			if (currentInput === value) return true;

		}

		return false;

	}

	return filterEngineRouter(ele, input, options, filterFun, allowed);
}

export { filterByValue }