import { coreFilterEngine } from './coreFilterEngine.js';

function filterByIncludeValueForValues(obj, input, options) {
	const inPlace = options.inPlace;
	const cs = options.cs;
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) option must be boolean');
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) option must be boolean');
	let allowed = undefined;
	function filterFun(key, value, currentInput){

		const isObject = !(typeof value !== 'object' || Array.isArray(value) || value === null);

    	if (isObject) {
    		return 'descend';
    	}

		const isString = typeof value === 'string';
    	const isArray = Array.isArray(value);

		if (!isString && !isArray) {
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

			if (isString || isArray) {
				if (value.includes(currentInput)) {
					return true;
				}
			}

		}

		return false;

	}
	return coreFilterEngine(obj, input, options.inPlace, options.depth, filterFun, allowed);
}

export { filterByIncludeValueForValues }