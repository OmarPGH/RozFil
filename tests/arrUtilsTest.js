import { arrUtils } from '../src/index.js';

let myArray = ['', '   ', Infinity, 'Infinity', Symbol('id'), 9999999999999n, '9999999999999n', 1, '2', true, 'true', false, 'false', undefined, 'undefined', NaN, 'NaN', null, 'null', 'Mohamed', 'Sayed', Date(), ['Osama', undefined, 'Ahmed'], "[{gameName: 'GTA V'}]", "[{}]", [], function sayHello() {return 'Hello'}, {user: 'Tamer', id: 8}, "{name: 'Samya', type: 'girl'}", "{}", {}];

let myBigArray = myArray.concat(myArray);

myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);
myBigArray = myBigArray.concat(myBigArray);

////////////////////////////////////////////////////////////////

let pfmcstart = performance.now();

// Write your experiments here
// ======================================

console.log('Start');

console.log(arrUtils.fbVal(true, myBigArray, 'Mohamed'))

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