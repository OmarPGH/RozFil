import { filterEngine } from './filterEngine.js';

function filterByIncludeValue(arr, input, options) {
	const cs = options.cs;
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) param must be boolean');
	let allowed = undefined;
	function filterFun(ele, currentInput){

		// const isObject = !(typeof ele !== 'object' || Array.isArray(ele) || ele === null);
		const isString = typeof ele === 'string';
    	const isArray = Array.isArray(ele);

		if (!isString && !isArray) {
        	return false;
    	}
		
		if (cs === false) {

			if (isString) {
				if (ele.toLowerCase().includes(currentInput.toLowerCase())) return true;
			}

			if (isArray) {
				for (let i = 0; i < ele.length; i++) {
					if (ele[i] === currentInput || typeof ele[i] === 'string' && ele[i].toLowerCase() === currentInput.toLowerCase()) return true;
				}
			}

		} else if (cs === true) {

			// if (isObject) {
 
			// }

			if (isString || isArray) {
				if (ele.includes(currentInput)) {
					return true;
				}
			}

		}

		return false;

	}
	return filterEngine(arr, input, options.inPlace, options.depth, filterFun, allowed);
}

export { filterByIncludeValue }