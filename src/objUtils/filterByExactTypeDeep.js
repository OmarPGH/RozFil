import { makeExactTypePredicate, EXTYPE_ALLOWED } from './filterByExactType.js';
import { resolveTypeTokens } from './typeTokens.js';
import { deepFilterEngine } from './deepFilterEngine.js';

function filterByExactTypeDeep(inPlace, obj, ...input) {
	if (typeof inPlace !== 'boolean') throw new Error('In place (inPlace) param must be boolean');
	input = resolveTypeTokens(input, EXTYPE_ALLOWED);
	return deepFilterEngine(makeExactTypePredicate(), inPlace, obj, input, undefined);
}

export { filterByExactTypeDeep };
