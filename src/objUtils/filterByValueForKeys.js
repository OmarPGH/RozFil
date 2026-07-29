import { filterEngine } from './filterEngine.js';

function filterByValueForKeys(obj, input, options) {
	const cs = options.cs;
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (cs) option must be boolean');
	let allowed = undefined;
	let iterate = !cs;
	function filterFun(key, value, currentInput){

		key = String(key);
		currentInput = String(currentInput);

		if (cs === false) {

			if (currentInput.toLowerCase() === key.toLowerCase()) {
				return true;
			}

		} else if (cs === true) {

			if (currentInput === key) {
				return true;
			}

		}

		const isObject = !(typeof value !== 'object' || Array.isArray(value) || value === null);

    	if (isObject) {
    		return 'descend';
    	}

		return false;

	}
	return filterEngine(obj, input, options.inPlace, options.depth, filterFun, allowed);
}

export { filterByValueForKeys }