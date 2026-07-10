import { translator as translate } from './translator.js';
import { invalid } from '../invalid.js';

function coreFilterEngine(filterFun, depth, obj, input, allowed) {

	if (obj === undefined) throw new Error('No object Input');

	let maxDepth = 1;
	let minDepth = 1;
	
	if (depth < minDepth) return obj;
	if (depth > maxDepth) throw new Error(`depth is more than ${maxDepth}`);

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

	const filterFunLocal = filterFun;

	for (let i = 0; i < inputLen; i++) {
	    let currentInput = input[i];

	    for (let j = 0; j < objLen; j++) {
	        let key = objKeys[j];
	        let value = obj[j];

	        if (filterFunLocal(value, currentInput) === false) {
	        	continue;
	        }

	      	

	    }
	    
	}

	obj.length = objLen; 

	return obj;

}

export { coreFilterEngine };