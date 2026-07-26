import { translator as translate, invalid } from '../shared/index.js';

function coreFilterEngine(obj, input, inPlace, depth, filterFun, allowed, iterate = true) {

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

	if (objLen < 1) throw new Error('Object items is less than 1');

	if (!inPlace) {
		
		try {
			obj = structuredClone(obj);
		} catch {
			throw new Error('Your object includes type of data unable to clone like [Symbol(\'Something\')]')
		}

	}

	if (!iterate){
		for (let i = 0; i < inputLen; i++) {
			delete obj[input[i]];
		}
		
		return obj;
	}

	const filterFunLocal = filterFun;

	function loopingOnData(obj, iterVar, currentDepth = 1) {

		let objKeys = Object.keys(obj);
		let objLen = objKeys.length;

	    let currentInput = input[iterVar];

	    for (let j = 0; j < objLen; j++) {
	        
	        let key = objKeys[j];
	        let value = obj[key];
	        let filterFunResult = filterFunLocal(key, value, currentInput);

	        if (filterFunResult === false) {
			    continue;
			} else if (filterFunResult === 'descend' && currentDepth < depth) {
			    loopingOnData(value, iterVar, currentDepth + 1);
			} else if (filterFunResult === true) {
			    delete obj[key];
			}

	    }
    
	}

	for (let i = 0; i < inputLen; i++) {

		loopingOnData(obj, i);

	}
	
	return obj;

}

export { coreFilterEngine };