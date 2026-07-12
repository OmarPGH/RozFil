import { invalid } from '../invalid.js';

function coreFilterEngine(filterFun, obj, input, allowed, iterate = true) {

	obj = structuredClone(obj);

	if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) throw new Error('this isn\'t object');

	input = [...new Set(input)];

	const inputLen = input.length;
	if (inputLen < 1) return obj;

	if (allowed !== undefined) {
		let allowedLen = allowed.length;
		if (inputLen > allowedLen) throw new Error(`Types is more than ${allowedLen}`);

		for (let i = 0; i < inputLen; i++) {
			input[i] = translate(`${input[i]}`);
		}

		if (!input.every(ele => allowed.includes(ele)) || input.includes(invalid)) throw new Error(`Type Error, only those allowed : \n ${allowed.join(' - ')}`);
	}

	let objKeys = Object.keys(obj);
	let objLen = objKeys.length;

	if (objLen < 1) throw new Error('object length is less than 1');

	if (!iterate){
		for (let i = 0; i < inputLen; i++) {
			delete obj[input[i]];
		}
		
		return obj;
	}

	const filterFunLocal = filterFun;

	for (let i = 0; i < inputLen; i++) {
	    let currentInput = input[i];

	    //---------------

	    // This part causes a bottleneck because it loops on the object
	    // even when it's unnecessary in certain cases. (WIP / Under development)

	    for (let j = 0; j < objLen; j++) {
	        let key = objKeys[j];
	        let value = obj[key];

	        if (filterFunLocal(key, value, currentInput) === false) {
	        	continue;
	        }

	      	delete obj[key];

	    }

	    //---------------
	    
	}

	return obj;

}

export { coreFilterEngine };