import { makeTypePredicate, TYPE_ALLOWED } from './filterByType.js';
import { resolveTypeTokens } from './typeTokens.js';
import { deepFilterEngine } from './deepFilterEngine.js';

function filterByTypeDeep(inPlace, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	input = resolveTypeTokens(input, TYPE_ALLOWED);
	return deepFilterEngine(makeTypePredicate(), inPlace, obj, input, undefined);
}

export { filterByTypeDeep };
