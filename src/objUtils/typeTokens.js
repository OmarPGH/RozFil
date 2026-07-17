import { translator as translate } from './translator.js';
import { invalid } from '../invalid.js';

function resolveTypeTokens(input, allowed) {

	input = [...new Set(input)];

	const inputLen = input.length;
	if (inputLen < 1) return input;

	const allowedLen = allowed.length;
	if (inputLen > allowedLen) throw new Error(`Types is more than ${allowedLen}`);

	for (let i = 0; i < inputLen; i++) {
		input[i] = translate(`${input[i]}`);
	}

	if (!input.every(ele => allowed.includes(ele)) || input.includes(invalid)) throw new Error(`Type Error, only those allowed : \n ${allowed.join(' - ')}`);

	return input;

}

export { resolveTypeTokens };
