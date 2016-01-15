'use strict'

import { compare } from './index.js';

let a = {
	cities: [
		{ name: 'San Francisco', nicknames: ['SF', 'the city'], id: 0 },
		{ name: 'Orlando', nicknames: ['O-town', 'The city beautiful'], id: 1 }
	],
	people: [
		{ name: 'Reid', hometown: 1, current_home: 0 },
		{ name: 'Joe', hometown: 2, current_home: 2 }
	]
}

let b = {
	cities: [
		{ name: 'Sun Valley', nicknames: ['A great place to ski'], id: 0 },
		{ name: 'San Francisco', nicknames: ['SF', 'the city'], id: 1 }
	],
	people: [ { name: 'Piper', hometown: 0, current_home: 1 } ]
}

console.log(compare(a, b));
	
	
let oops = {
	cities: [
		{ name: 'San Francisco', nicknames: ['SF', 'the city'], id: 0 },
		// oops, here id is a list but should be a scalar
		{ name: 'Orlando', nicknames: ['O-town', 'The city beautiful'], id: [] }
		],
	people: [
		{ name: 'Reid', hometown: 1, current_home: 0 },
		{ name: 'Joe', hometown: 2, current_home: 2 }
	]
}

console.log(compare(b, oops));

