import { makeValueEqualityPredicate } from './filterByValue.js';
import { deepFilterEngine } from './deepFilterEngine.js';

function filterByValueDeep(inPlace, cs, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	if (typeof cs !== 'boolean') throw new Error('Case sensitivity (CS) must be boolean');
	return deepFilterEngine(makeValueEqualityPredicate(cs), inPlace, obj, input, undefined);
}

export { filterByValueDeep };
