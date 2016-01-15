# treetorn

A JavaScript package that helps you enforce data strucutre consistency and write "schemas" by example.

## Installation

```
npm install treetorn --save
```

You may instead just want to use treetorn for testing:

```
npm install treetorn --save-dev
```

## Examples

Compare two data structures that are equivalent:

```javascript

import compare from 'treetorn';

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

compare(a, b);
// returns { passes: true, err: undefined }
```

Compare two data structures that have a small difference:

```javascript
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

compare(b, oops);
// returns { passes: false, err: '0 is a leaf but [] is not' }
```

## Philosophy and detail
Treetorn doesn't diff two object trees, instead it determines whether they're equivalent, with a few assumptions built in.

#### Objects and Maps are treated as dictionaries
```javascript
object.constructor === Object // if true, object is treated as a dictionary
```
This includes object literals like:
```javascript
let object = {whoami: 'an object but really a dictionary'};
object.constructor === Object // returns true
```

Map objects are treated as dictionaries:
```javascript
object.constructor === Map    // if true, object is treated as a dictionary
```

#### Arrays are treated as lists
Lists do not need to have the same number of items to be equivalent. Treetorn does make sure that all objects in a list
compare to be the same:
```javascript
let a = [1, 2, 3];
let b = [4, 5, 6];
// compare() must be true when comparing the first item of a with the remaining items in a and
// must be true when comparing the first item in a with each item in b
```

If one or both lists are empty, they are equivalent.

#### All other objects and primitives are treated as leaf nodes. 
compare() of any two leaf nodes always returns true.

#### Not all collection types are supported!
WeakMap, Set, and WeakSet are treated as leaf nodes. This is probably not what you want.

#### What's next
* Support additional collection types.
* When two nodes in the tree don't match, return the tree path to the mismatching nodes.



