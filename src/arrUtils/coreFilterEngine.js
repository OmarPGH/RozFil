import { translator as translate } from './translator.js';
import { invalid } from '../invalid.js';

function coreFilterEngine(filterFun, arr, input, allowed) {

	if (!Array.isArray(arr)) throw new Error('No array input, or input isn\'t array');

	input = [...new Set(input)];

	const inputLen = input.length;
	if (inputLen < 1) return arr;

	if (allowed !== undefined) {
		let allowedLen = allowed.length;
		if (inputLen > allowedLen) throw new Error(`Types is more than ${allowedLen}`);

		for (let i = 0; i < inputLen; i++) {
			input[i] = translate(`${input[i]}`);
		}

		if (!input.every(ele => allowed.includes(ele)) || input.includes(invalid)) throw new Error(`Type Error, only those allowed : \n ${allowed.join(' - ')}`);
	}

	let arrLen = arr.length;

	if (arrLen < 1) throw new Error('Array length is less than 1');

	const filterFunLocal = filterFun;

	for (let i = 0; i < inputLen; i++) {
	    let currentInput = input[i];
	    let writeIndex = 0;

	    for (let j = 0; j < arrLen; j++) {
	        let ele = arr[j];

	        if (filterFunLocal(ele, currentInput) === false) {
	            arr[writeIndex] = ele;
	            writeIndex++;
	        }
	    }

	    arrLen = writeIndex; 
	    if (arrLen === 0) break;
	    
	}

	arr.length = arrLen; 

	return arr;

}

export { coreFilterEngine };