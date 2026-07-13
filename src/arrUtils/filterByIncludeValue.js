import { coreFilterEngine } from './coreFilterEngine.js';

function filterByIncludeValue(inPlace, cs, arr, ...input) {
	let allowed = undefined;
	function filterFun(ele, currentInput){

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
					if (typeof ele[i] === 'string' && ele[i].toLowerCase() === currentInput.toLowerCase()) return true;
				}
			}

		} else if (cs === true) {

			if (ele.includes(currentInput)) {
				return true;
			}

		}

		return false;

	}
	return coreFilterEngine(filterFun, inPlace, arr, input, allowed);
}

export { filterByIncludeValue }