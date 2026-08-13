// DEPRECATED: jsonObjArrRe has been replaced with isValidJSONObjectOrArray() in jsonValidator.js
// Reason: The regex pattern was vulnerable to Polynomial ReDoS attacks
// Please use: import { isValidJSONObjectOrArray } from './jsonValidator.js'

export let arrRe = /^\[.*\]$/;
export let objectRe = /^\{.*\}$/;
export let numberRe = /^-?\d+(\.\d+)?$/;
export let bigintRe = /^-?\d+n$/;
export let emptyStringWithSpacesRe = /^\s+$/;
