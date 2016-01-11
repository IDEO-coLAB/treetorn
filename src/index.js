'use strict'

import _ from 'underscore';
import util from 'util';

// FIXME: how do we distinguish between Objects as dictionaries and objects as leaf nodes, e.g. a leaf node that is a date object.

/* 
	Compares reference data structure to a live data structure, called the state.
 
	Returns an object with keys:
		passes: boolean, are test and state equivalent?
		err: string, where do test and state differ?
  
	The test is opinionated and expects state to comply with 
	some guidelines:
	* Each node in the data structure must be a Dictionary (Map object or Object), Array, or primitive
	* Objects in a list must recursively be of the same type
	* Data structure leaf node primitives must be strings, numbers, booleans, or undefined
*/
let compareState = function(test, state) {
	if (isLeaf(test)) {
		return compareLeaf(test, state);
	}

	if (isArray(test)) {
		return compareArray(test, state);
	}

	// includes Map, or Object
	return compareMap(test, state);
};

function compareArray(test, state) {
	// make sure state is also an array
	if (! isArray(state)) {
		return { 
			passes: false, 
			err: 'test ("' + util.inspect(test, false, null) + '"") is an array but state ("' + util.inspect(state, false, null) + '") is not'
		}
	}

	// if either test or state is empty, return true
	if (test.length === 0 || state.length === 0) {
		return {
			passes: true,
			err: undefined
		}
	}

	// Both arrays have at least one item. Check that all
	// items in both arrays are the same.
	// pull out the first object of test array and make sure all other
	// objects in both test and state are the same.
	let prototype = _.first(test);

	// make sure prototype matches remaining elements in test array
	let testReturn = comparePrototypeArray(prototype, _.rest(test));
	if (testReturn.passes === false) {
		return testReturn;
	}

	// make sure prototype matches remaining elements in state
	let stateReturn = comparePrototypeArray(prototype, state);
	return stateReturn;
}

// compare prototype object to every object in state
// returning a failing object at the first non-matching
// object encountered
function comparePrototypeArray(prototype, state) {
	if (state.length < 1) {
		return {passes: true, err: undefined};
	} 

	// check prototype agains the first object in state
	let r = compareState(prototype, _.first(state));
	if (r.passes === false) {
		return r;
	}

	// recursively check rest of state
	return comparePrototypeArray(prototype, _.rest(state));
}

function compareLeaf(test, state) {
	if (isLeaf(state)) {
		// already tested that state is a leaf
		return { passes: true, err: undefined };
	} else {
		return { 
			passes: false, 
			err: 'test ("' + util.inspect(test, false, null) + '") is a leaf but state ("' + util.inspect(state, false, null) + '") is not'
		}
	}
}

// make sure the two objects have the same keys and recursively call
// compareState on values. Test and state can be objects or Map objects.
function compareMap(test, state) {
	let testKey = anyKey(test);

	// if test is empty, make sure state is also empty	
	if (testKey === undefined) {
		// no keys left in test, so make sure no keys are left in state
		let stateKey = anyKey(state);
		if (stateKey === undefined) {
			return {passes: true, err: undefined};
		} else {
			return {
				passes: false, 
				err: 'state has key ("' + stateKey + '") that\'s missing from test' 
			}
		}
	}

	// we've got a key from test, make sure state has that key too
	if (containsKey(testKey, state) === undefined) {
		return {
			passes: false,
			err: 'test has key ("' + testKey + '") that\'s missing from state'
		}
	}

	// test and state both have the key. Make sure values are the same
	let sameValue = compareState(get(testKey, test), get(testKey, state));
	if (sameValue.passes === false) {
		return sameValue;
	}

	// values are the same. Remove testKey and recurse with rest of map
	let trimmedTest = copyWithoutKey(testKey, test);
	let trimmedState = copyWithoutKey(testKey, state);

	return compareMap(trimmedTest, trimmedState);
}

function isMap(object) {
	return object.constructor === Map;	
}

let isArray = function(object) {
	return object.constructor === Array;
}

let isLeaf = function(object) {
	let type = typeof object;
	return (
		type === 'number'  || 
		type === 'string'  ||
		type === 'boolean' ||
		type === 'undefined'
		);
}

let containsKey = function(key, object) {
	if (object.constructor === Map) {
		let keys = object.keys();
		return keys.next().value;
	} else {
		return _.first(Object.keys(object));
	}
}

// returns a 'first' key from the object or Map
let anyKey = function(object) {
	if (object.constructor === Map) {
		let keys = object.keys();
		return keys.next().value;
	} else {
		return _.first(Object.keys(object));
	}
}

// generic getter for either object or Map
let get = function(key, object) {
	if (object.constructor === Map) {
		return object.get(key);
	} else {
		return object[key];
	}
}

// deep copy the object without the given key and return it
let copyWithoutKey = function(key, object) {
	// made this an inner function cuz don't want anyone else accessing it
	let _deleteKey = function(key, object) {
		if (object.constructor === Map) {
			object.delete(key);
		} else {
			delete object[key];
		}
	}

	let newObject = {};
	Object.assign(newObject, object);
	_deleteKey(key, newObject);
	return newObject;
}

export { compareState };
