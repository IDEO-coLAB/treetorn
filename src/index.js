'use strict'

import _ from 'underscore';
import util from 'util';
import { isDictionary, isArray, containsKey, anyKey, get, copyWithoutKey } from './helpers';

/* 
	Recursively compares a reference data structure to a given data structure (the state).
 
	compare is opinionated and expects test and state to be data structures that comply with 
	some rules:
	
	* All pbjects in a list must be of the same type (i.e. compare(a, b) must return true for all elements in the list)
	* Maps and objects are treated as dictionaries. Two dictionaries are the same if they have exactly the same set of keys 
		and for each key, the value at the key is the same for test and state.
	* An object where object.constructor === Object is treated as a dictionary (e.g. let x = {foo:1} is treated as a Dictionary)
	* An object where object.constructor === Map is treated as a dictionary
	* All other objects are treated as a leaf node. compare() of any two leaf nodes always returns true regardless of 
		object type or primitive type 
	* Doesn't currently support WeakMaps, Sets, WeakMaps

	Returns an object with keys:
		passes: boolean, are test and state equivalent?
		err: string, where do test and state differ?
*/
let compare = function(test, state) {
	if (isDictionary(test) === true) {
		return compareDictionary(test, state);
	}

	if (isArray(test) === true) {
		return compareArray(test, state);
	}

	// test ie neither dictionary nor array so we'll assume it's a leaf
	// need to test whether state is also a leaf
	return compareLeaf(test, state);
};

function compareArray(test, state) {
	// make sure state is also an array
	if (! isArray(state)) {
		return { 
			passes: false, 
			err: util.inspect(test, false, null) + ' is an array but ' + util.inspect(state, false, null) + ' is not'
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
	let r = compare(prototype, _.first(state));
	if (r.passes === false) {
		return r;
	}

	// recursively check rest of state
	return comparePrototypeArray(prototype, _.rest(state));
}

function compareLeaf(test, state) {
	// checked that test is neither dictionary nor array, now check state
	if (isDictionary(state) === false && isArray(state) === false) {
		return { passes: true, err: undefined };
	} else {
		return { 
			passes: false, 
			err: util.inspect(test, false, null) + ' is a leaf but ' + util.inspect(state, false, null) + ' is not'
		}
	}
}

// make sure the two objects have the same keys and recursively call
// compare on values. Test and state can be objects or Map objects.
function compareDictionary(test, state) {
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
				err: 'key ("' + stateKey + '") found in only second input' 
			}
		}
	}

	// we've got a key from test, make sure state has that key too
	if (containsKey(testKey, state) === undefined) {
		return {
			passes: false,
			err: 'key ("' + testKey + '") found in only first input'
		}
	}

	// test and state both have the key. Make sure values are the same
	let sameValue = compare(get(testKey, test), get(testKey, state));
	if (sameValue.passes === false) {
		return sameValue;
	}

	// values are the same. Remove testKey and recurse with rest of map
	let trimmedTest = copyWithoutKey(testKey, test);
	let trimmedState = copyWithoutKey(testKey, state);

	return compareDictionary(trimmedTest, trimmedState);
}

export { compare };
