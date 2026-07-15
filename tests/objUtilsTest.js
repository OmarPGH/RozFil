import { objUtils } from '../src/index.js';

let myObject = {};

let keys = ['user', 'skills', 'id', 'area'];
let vals = ['Omar', ['JS', 'Node.js'], Symbol('id'), {country: 'egypt', city: 'Alex'}];

let keysLen = keys.length;
let totalKeys = 5000;

for (let i = 1; i <= totalKeys; i++) {
	let keyIndex = i % keysLen;
	myObject[`${keys[keyIndex]}_${i}`] = vals[keyIndex];
}

////////////////////////////////////////////////////////////////

let pfmcstart = performance.now();

// Write your experiments here
// ======================================

console.log('Start');

console.log(objUtils.fbIncludeValfv(true, true, myObject, 'Omar'))
// console.log(objUtils.fbIncludeValfv(true, true, myObject, 'egypt'))

console.log('End');

// ======================================

let pfmcend = performance.now();

////////////////////////////////////////////////////////////////

// performance displaying code

console.log(pfmcend - pfmcstart);

// automatic refresh code

// setTimeout(() => {
// 	location.reload();
// }, 1000)