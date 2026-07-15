import { coreFilterEngine } from './coreFilterEngine.js';

function filterByIncludeValueForValues(inPlace, cs, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) param must be boolean');
	let allowed = undefined;
	function filterFun(key, value, currentInput){

		// const isObject = !(typeof value !== 'object' || Array.isArray(value) || value === null);
		const isString = typeof value === 'string';
    	const isArray = Array.isArray(value);

		if (!isString && !isArray/* && !isObject*/) {
        	return false;
    	}
		
		if (cs === false) {

			if (isString) {
				if (value.toLowerCase().includes(currentInput.toLowerCase())) return true;
			}

			if (isArray) {
				for (let i = 0; i < value.length; i++) {
					if (value[i] === currentInput || typeof value[i] === 'string' && value[i].toLowerCase() === currentInput.toLowerCase()) return true;
				}
			}

		} else if (cs === true) {

			// if (isObject) {
 
			// }

			if (isString || isArray) {
				if (value.includes(currentInput)) {
					return true;
				}
			}

		}

		return false;

	}
	return coreFilterEngine(filterFun, inPlace, obj, input, allowed);
}

export { filterByIncludeValueForValues }