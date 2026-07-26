import { objUtils } from '../src/index.js';

let myObject = {
	user1: { name: 'Omar', country: 'Egypt', city: 'Alex', skills:{one: ['JS', 'Node.js'], two: ['Rust']} },
	user2: { name: 'Yuna', country: 'South Korea', city: 'Seoul', skills:{one: ['C#'], two: ['Python', 'Flask']} },
	user3: { name: 'Harry', country: 'USA', city: 'Florida', skills:{one: ['C++'], two: ['PHP'], three: ['SQL']} },
	user4: { name: 'Sakura', country: 'Japan', city: 'Tokyo', skills:{one: ['Go'], two: ['Rust']} },
	user5: { name: 'Clara', country: 'German', city: 'Stuttgart', skills:{one: ['C', 'C++', 'C#'], two: ['Rust']} },
}

////////////////////////////////////////////////////////////////

let pfmcstart = performance.now();

// Write your experiments here
// ======================================

console.log('Start');

console.log(objUtils.fbIncludeValfv(myObject, ['c#', 'pHp'], {inPlace: true, cs: false, depth: 3}))
// console.log(objUtils.fbValfv(myObject, ['German'], {inPlace: true, cs: false, depth: 2}))
// console.log(objUtils.fbValfk(myObject, ['name'], {inPlace: true, cs: false, depth: 2}))

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