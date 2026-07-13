import { objUtils } from '../src/index.js';

let myObject = {};

let keys = ['user', 'skills', 'id'];
let vals = ['Omar', ['JS', 'Node.js'], Symbol('id')];

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

console.log(objUtils.fbValfk(false, true, myObject, 'user_4995', 'id_4997'))

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