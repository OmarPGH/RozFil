import { makeTypeSmartPredicate, SMART_ALLOWED } from './filterByTypeSmart.js';
import { resolveTypeTokens } from './typeTokens.js';
import { deepFilterEngine } from './deepFilterEngine.js';

function filterByTypeSmartDeep(inPlace, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	input = resolveTypeTokens(input, SMART_ALLOWED);
	return deepFilterEngine(makeTypeSmartPredicate(), inPlace, obj, input, undefined);
}

export { filterByTypeSmartDeep };
