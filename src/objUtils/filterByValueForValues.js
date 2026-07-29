import { filterEngine } from './filterEngine.js';

function filterByValueForValues(obj, input, options) {
	const cs = options.cs;
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) option must be boolean');
	let allowed = undefined;
	function filterFun(key, value, currentInput){

		const isObject = !(typeof value !== 'object' || Array.isArray(value) || value === null);

    	if (isObject) {
    		return 'descend';
    	}
    	
		value = String(value);
		currentInput = String(currentInput);
		
		if (cs === false) {

			if (currentInput.toLowerCase() === value.toLowerCase()) {
				return true;
			}

		} else if (cs === true) {

			if (currentInput === value) {
				return true;
			}

		}

		return false;

	}
	return filterEngine(obj, input, options.inPlace, options.depth, filterFun, allowed);
}

export { filterByValueForValues }