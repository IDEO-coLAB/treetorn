'use strict'

var compareState = require('../lib/index.js').compareState;

describe('comparing test and state', () => {
	it('should return true when test and state are numbers', () => {
		expect(compareState(1, 1).passes).toBe(true);
	});

	it('should return true when test is string and state is undefined', () => {
		expect(compareState(1, undefined).passes).toBe(true);
	});

	it('should return false when test is a string and state is an array', () => {
		expect(compareState('string', new Array()).passes).toBe(false);
	});

	it('should return true when test and state are arrays of numbers', () => {
		var test = [1, 2, 3, 4];
		var state = [5, 6, 7, 8, 9, 10];
		var r = compareState(test, state);
		expect(r.passes).toBe(true);
	});

	it('should return false when test and state are arrays but with different kinds of objects', () => {
		// test is array of numbers, state is array of dictionaries
		var test = [1, 2, 3, 4];
		var state = [
			{'foo': 1},
			{'bar': 1}
		]
		var r = compareState(test, state);
		// console.log(r.err);
		expect(r.passes).toBe(false);
	});

	it('should return true when test and state are both objects with keys', () => {
		var test = {
			cityName: 'San Francisco',
			cityNicknames: ['Frisco', 'SF', 'the city']
		}

		var state = {
			cityName: 'Orlando',
			cityNicknames: ['O town', 'The city beautiful']
		}

		var r = compareState(test, state);
		expect(r.passes).toBe(true);
	});

	it('should return false when test has a key missing from state', () => {
		var test = {
			cityName: 'San Francisco',
			cityNicknames: ['Frisco', 'SF', 'the city']
		}

		var state = {
			cityName: 'Orlando'
		}

		var r = compareState(test, state);
		expect(r.passes).toBe(false);
	});

	it('should return false when state has a key missing from test', () => {
		var test = {
			cityName: 'San Francisco'
		}

		var state = {
			cityName: 'Orlando',
			cityNicknames: ['O town', 'The city beautiful']
		}

		var r = compareState(test, state);
		expect(r.passes).toBe(false);
	});

	it('should return true when test and state are big data structures and match', () => {
		var test = {
			cities: [
				{
					name: 'San Francisco',
					nicknames: ['SF', 'the city'],
					id: 0
				},
				{
					name: 'Orlando',
					nicknames: ['O-town', 'The city beautiful'],
					id: 1
				},
				{
					name: 'Oakland',
					nicknames: [],
					id: 2
				}
			],
			people: [
			{
				name: 'Reid',
				hometown: 1,
				current_home: 0
			},
			{
				name: 'Joe',
				hometown: 2,
				current_home: 2
			}
			]
		}

		var state = {
			cities: [
				{
					name: 'Sun Valley',
					nicknames: ['A great place to ski'],
					id: 0
				},
				{
					name: 'San Francisco',
					nicknames: ['SF', 'the city'],
					id: 1
				}
			],
			people: [
			{
				name: 'Piper',
				hometown: 0,
				current_home: 1
			}
			]
		}

		var r = compareState(test, state);
		expect(r.passes).toBe(true);
	});

	it('should return false when test and state are big data structures with a subtle mismatch', () => {
		var test = {
			cities: [
				{
					name: 'San Francisco',
					nicknames: ['SF', 'the city'],
					id: 0
				},
				{
					name: 'Orlando',
					nicknames: ['O-town', 'The city beautiful'],
					id: [] // oops, id is a list
				},
				{
					name: 'Oakland',
					nicknames: [],
					id: 2
				}
			],
			people: [
			{
				name: 'Reid',
				hometown: 1,
				current_home: 0
			},
			{
				name: 'Joe',
				hometown: 2,
				current_home: 2
			}
			]
		}

		var state = {
			cities: [
				{
					name: 'Sun Valley',
					nicknames: ['A great place to ski'],
					id: 0
				},
				{
					name: 'San Francisco',
					nicknames: ['SF', 'the city'],
					id: 1
				}
			],
			people: [
			{
				name: 'Piper',
				hometown: 0,
				current_home: 1
			}
			]
		}

		var r = compareState(test, state);
		expect(r.passes).toBe(false);
	})		
});

