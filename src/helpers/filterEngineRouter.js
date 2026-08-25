import { arrayFilterEngine, objectFilterEngine } from '../engines/index.js';

function filterEngineRouter(ele, input, options, filterFun, allowed) {
	if (Array.isArray(ele)) return arrayFilterEngine(ele, input, options, filterFun, allowed);
	if (typeof ele === 'object' && !Array.isArray(ele) && ele !== null) return objectFilterEngine(ele, input, options, filterFun, allowed);
 	
 	throw new Error('Unsupported type');
}

export { filterEngineRouter }