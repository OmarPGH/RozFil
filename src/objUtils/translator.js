import { invalid } from '../invalid.js';

function translator(input = invalid) {

	input = input.toLowerCase().trim();

	input === 'str' ? input = 'string' :
	input === 'string' ? input = 'string' :
	input === 'num' ? input = 'number' :
	input === 'number' ? input = 'number' :
	input === 'bln' ? input = 'boolean' :
	input === 'boolean' ? input = 'boolean' :
	input === 'uf' ? input = 'undefined' :
	input === 'undefined' ? input = 'undefined' :
	input === 'fun' ? input = 'function' :
	input === 'function' ? input = 'function' :
	input === 'nl' ? input = 'null' :
	input === 'null' ? input = 'null' :
	input === 'arr' ? input = 'array' :
	input === 'array' ? input = 'array' :
	input === 'obj' ? input = 'object' :
	input === 'object' ? input = 'object' :
	input === 'nan' ? input = 'NaN' :
	input === 'bi' ? input = 'bigint' :
	input === 'bigint' ? input = 'bigint' :
	input === 'ifty' ? input = 'Infinity' :
	input === 'infinity' ? input = 'Infinity' :
	input === 'smbl' ? input = 'symbol' :
	input === 'symbol' ? input = 'symbol' :
	input === 'tru' ? input = 'true' :
	input === 'true' ? input = 'true' :
	input === 'fls' ? input = 'false' :
	input === 'false' ? input = 'false' :
	input === '' ? input = 'emptyString' :
	input === 'emptystr' ? input = 'emptyString' :
	input === 'emptystring' ? input = 'emptyString' :
	input === 'ss' ? input = 'emptyStringWithSpaces' :
	input === 'emptystringwithspaces' ? input = 'emptyStringWithSpaces' :
	input === 'ss?' ? input = 'emptyStringOrWithSpaces' :
	input === 'emptystringorwithspaces' ? input = 'emptyStringOrWithSpaces' :
	input === '{s?}' ? input = 'emptyObject' :
	input === 'emptyobj' ? input = 'emptyObject' :
	input === 'emptyobject' ? input = 'emptyObject' :
	input === '[s?]' ? input = 'emptyArray' :
	input === 'emptyarr' ? input = 'emptyArray' :
	input === 'emptyarray' ? input = 'emptyArray' :
	input === 'date' ? input = 'date' :
	input = invalid;

	return input;

}

export { translator };
