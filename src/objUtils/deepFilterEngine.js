import { coreFilterEngine } from './coreFilterEngine.js';

function isPlainObject(v) {
	if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
	const proto = Object.getPrototypeOf(v);
	return proto === Object.prototype || proto === null;
}

function deepFilterEngine(filterFun, inPlace, obj, input, allowed = undefined) {

	let root = obj;

	if (!inPlace) {

		try {
			root = structuredClone(obj);
		} catch {
			throw new Error('Your object includes type of data unable to clone like [Symbol(\'Something\')]')
		}

	}

	if (typeof root !== 'object' || Array.isArray(root) || root === null) throw new Error('this isn\'t object');

	if ([...new Set(input)].length < 1) return root;

	if (Object.keys(root).length < 1) throw new Error('object length is less than 1');

	const seen = new WeakSet();
	const stack = [root];

	while (stack.length) {

		const node = stack.pop();
		if (seen.has(node)) continue;
		seen.add(node);

		if (Object.keys(node).length === 0) continue;

		coreFilterEngine(filterFun, true, node, input, allowed, true);

		const keys = Object.keys(node);
		for (let i = 0; i < keys.length; i++) {
			const value = node[keys[i]];
			if (isPlainObject(value)) stack.push(value);
		}

	}

	return root;

}

export { deepFilterEngine, isPlainObject };
