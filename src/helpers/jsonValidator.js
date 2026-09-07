export function isJsonNum(value) {
	try {
		let jsonParse = JSON.parse(value);
		if (typeof jsonParse === 'number' && !Number.isNaN(jsonParse) && jsonParse !== Infinity) {
			return true;
		}
	} catch {
		return false;
	}
}

export function isJsonObjArr(value) {
	if (isJsonArr(value) || isJsonObj(value)) {
		return true;
	} else {
		return false;
	}
} 

export function isJsonArr(value) {
	try {
		if (Array.isArray(JSON.parse(value))) {
			return true;
		}
	} catch {
		return false;
	}
}

export function isJsonObj(value) {
	try {
		let jsonParse = JSON.parse(value);
		if (typeof jsonParse === 'object' && jsonParse !== null && !Array.isArray(jsonParse)) {
			return true;
		}
	} catch {
		return false;
	}
}