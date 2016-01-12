'use strict'

import _ from 'underscore';

function isDictionary(object) {
	return (object === undefined)?
		false :
		(
			object.constructor === Map ||
			object.constructor === Object
		);
}

function isArray(object) {
	return (object === undefined)?
		false :
		object.constructor === Array;
}

function containsKey(key, object) {
	if (object.constructor === Map) {
		let keys = object.keys();
		return keys.next().value;
	} else {
		return _.first(Object.keys(object));
	}
}

// returns a 'first' key from the object or Map
function anyKey(object) {
	if (object.constructor === Map) {
		let keys = object.keys();
		return keys.next().value;
	} else {
		return _.first(Object.keys(object));
	}
}

// generic getter for either object or Map
function get(key, object) {
	if (object.constructor === Map) {
		return object.get(key);
	} else {
		return object[key];
	}
}

// deep copy the object without the given key and return it
function copyWithoutKey(key, object) {
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

export { isDictionary, isArray, containsKey, anyKey, get, copyWithoutKey };