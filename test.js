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
	it('Custom Console', () => {
		const fs = require('fs');
		const debugLog = fs.createWriteStream('./debug.log');
		const errorLog = fs.createWriteStream('./error.log');
		const logger = require('./bundle').create(debugLog, errorLog);
		logger.log('this is .log output').error('this is .error output');
		// const fc = fs.readFileSync('/debug.log', { encoding: 'utf8' });
		fs.unlinkSync('./debug.log');
		fs.unlinkSync('./error.log');
	});
	it('wrap()', () => {
		const fs = require('fs');
		const debugLog = fs.createWriteStream('./debug.log');
		const errorLog = fs.createWriteStream('./error.log');
		const myConsole = new console.Console(debugLog, errorLog);
		const logger = require('./bundle').wrap(myConsole);
		logger.log('this is .log output').error('this is .error output');
		fs.unlinkSync('./debug.log');
		fs.unlinkSync('./error.log');
	});
});
