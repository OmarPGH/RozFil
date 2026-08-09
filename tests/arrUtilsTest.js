import { fbVal, fbType } from '../src/index.js';

let myArray = ['', '   ', Infinity, 'Infinity', Symbol('id'), 9999999999999n, '9999999999999n', 1, '2', true, 'true', false, 'false', undefined, 'undefined', NaN, 'NaN', null, 'null', 'Mohamed', 'Sayed', Date(), ['Osama', undefined, 'Ahmed'], "[{gameName: 'GTA V'}]", "[{}]", [], function sayHello() {return 'Hello'}, {user: 'Tamer', id: 8}, "{name: 'Samya', type: 'girl'}", "{}", {}, {
	user1: { name: 'Omar', country: 'Egypt', city: 'Alex', skills:{one: ['JS', 'Node.js'], two: ['Rust']} },
	user2: { name: 'Yuna', country: 'South Korea', city: 'Seoul', skills:{one: ['C#'], two: ['Python', 'Flask']} },
	user3: { name: 'Harry', country: 'USA', city: 'Florida', skills:{one: ['C++'], two: ['PHP'], three: ['SQL']} },
	user4: { name: 'Sakura', country: 'Japan', city: 'Tokyo', skills:{one: ['Go'], two: ['Rust']} },
	user5: { name: 'Clara', country: 'German', city: 'Stuttgart', skills:{one: ['clang', [{ n1: 'C'}, {n2: 'C++'}, {n2: 'C#'}]], two: ['Python']} },
}];

// let myBigArray = myArray.concat(myArray);

// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);
// myBigArray = myBigArray.concat(myBigArray);

////////////////////////////////////////////////////////////////

let pfmcstart = performance.now();

// Write your experiments here
// ======================================

console.log('Start');

console.log(fbType(myArray, ['str'], {inPlace: true, cs: false, depth: 7, rigor: 3}))

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