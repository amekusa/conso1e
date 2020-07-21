const assert = require('assert');

describe('Logger:', () => {
	it('global() returns singleton', () => {
		const Logger = require('./bundle');
		const x = Logger.global();
		const y = Logger.global();
		assert.strictEqual(x, y);
	});
	it('Overwriting console', () => {
		const original = console;
		console = require('./bundle').create();
		assert.strictEqual(console.core, original);
		console.log('this is overwritten console.log output');
		console = original;
	});
	it('Method Chaining', () => {
		const logger = require('./bundle').create();
		logger.log('this is .log output').log('this is chained .log output');
	});
});
