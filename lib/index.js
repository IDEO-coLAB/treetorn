'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.compareState = undefined;

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FIXME: how do we distinguish between Objects as dictionaries and objects as leaf nodes, e.g. a leaf node that is a date object.

/* 
	Is this primarily for validating Javascript object data structures (vs stringified JSON?). This is important, because if JS, then it
	may be perfectly valid to have an element in a data structure that is a Date or Moment object. If it's more for stringified JSON, then
	we can't have a Date or Moment object, but instead need those objects to be serialized to JSON.
	*/

/* 
	Compares test data structure to state.
 
	Returns a Map with keys
	passes: are test and state equivalent?
	err: where do test and state differ?
  
	The test is opinionated and expects state to comply with 
	some guidelines:
	* Each node in the data structure must be a Map, Array, or primitive (number, string)
	* Objects in a list must be of the same type
	* Data structure leaf nodes must be strings, numbers, booleans, or undefined
*/
var compareState = function compareState(test, state) {
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
	if (!isArray(state)) {
		return {
			passes: false,
			err: 'test ("' + _util2.default.inspect(test, false, null) + '"") is an array but state ("' + _util2.default.inspect(state, false, null) + '") is not'
		};
	}

	// if either test or state is empty, return true
	if (test.length === 0 || state.length === 0) {
		return {
			passes: true,
			err: undefined
		};
	}

	// Both arrays have at least one item. Check that all
	// items in both arrays are the same.
	// pull out the first object of test array and make sure all other
	// objects in both test and state are the same.
	var prototype = _underscore2.default.first(test);

	// make sure prototype matches remaining elements in test array
	var testReturn = comparePrototypeArray(prototype, _underscore2.default.rest(test));
	if (testReturn.passes === false) {
		return testReturn;
	}

	// make sure prototype matches remaining elements in state
	var stateReturn = comparePrototypeArray(prototype, state);
	return stateReturn;
}

// compare prototype object to every object in state
// returning a failing object at the first non-matching
// object encountered
function comparePrototypeArray(prototype, state) {
	if (state.length < 1) {
		return { passes: true, err: undefined };
	}

	// check prototype agains the first object in state
	var r = compareState(prototype, _underscore2.default.first(state));
	if (r.passes === false) {
		return r;
	}

	// recursively check rest of state
	return comparePrototypeArray(prototype, _underscore2.default.rest(state));
}

function compareLeaf(test, state) {
	if (isLeaf(state)) {
		// already tested that state is a leaf
		return { passes: true, err: undefined };
	} else {
		return {
			passes: false,
			err: 'test ("' + _util2.default.inspect(test, false, null) + '") is a leaf but state ("' + _util2.default.inspect(state, false, null) + '") is not'
		};
	}
}

// make sure the two objects have the same keys and recursively call
// compareState on values. Test and state can be objects or Map objects.
function compareMap(test, state) {
	var testKey = anyKey(test);

	// if test is empty, make sure state is also empty	
	if (testKey === undefined) {
		// no keys left in test, so make sure no keys are left in state
		var stateKey = anyKey(state);
		if (stateKey === undefined) {
			return { passes: true, err: undefined };
		} else {
			return {
				passes: false,
				err: 'state has key ("' + stateKey + '") that\'s missing from test'
			};
		}
	}

	// we've got a key from test, make sure state has that key too
	if (containsKey(testKey, state) === undefined) {
		return {
			passes: false,
			err: 'test has key ("' + testKey + '") that\'s missing from state'
		};
	}

	// test and state both have the key. Make sure values are the same
	var sameValue = compareState(get(testKey, test), get(testKey, state));
	if (sameValue.passes === false) {
		return sameValue;
	}

	// values are the same. Remove testKey and recurse with rest of map
	var trimmedTest = copyWithoutKey(testKey, test);
	var trimmedState = copyWithoutKey(testKey, state);

	return compareMap(trimmedTest, trimmedState);
}

function isMap(object) {
	return object.constructor === Map;
}

var isArray = function isArray(object) {
	return object.constructor === Array;
};

var isLeaf = function isLeaf(object) {
	var type = typeof object === 'undefined' ? 'undefined' : _typeof(object);
	return type === 'number' || type === 'string' || type === 'boolean' || type === 'undefined';
};

var containsKey = function containsKey(key, object) {
	if (object.constructor === Map) {
		var keys = object.keys();
		return keys.next().value;
	} else {
		return _underscore2.default.first(Object.keys(object));
	}
};

// returns a 'first' key from the object or Map
var anyKey = function anyKey(object) {
	if (object.constructor === Map) {
		var keys = object.keys();
		return keys.next().value;
	} else {
		return _underscore2.default.first(Object.keys(object));
	}
};

// generic getter for either object or Map
var get = function get(key, object) {
	if (object.constructor === Map) {
		return object.get(key);
	} else {
		return object[key];
	}
};

// deep copy the object without the given key and return it
var copyWithoutKey = function copyWithoutKey(key, object) {
	// made this an inner function cuz don't want anyone else accessing it
	var _deleteKey = function _deleteKey(key, object) {
		if (object.constructor === Map) {
			object.delete(key);
		} else {
			delete object[key];
		}
	};

	var newObject = {};
	Object.assign(newObject, object);
	_deleteKey(key, newObject);
	return newObject;
};

exports.compareState = compareState;