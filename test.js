const assert = require('assert');
const Logger = require('./bundle');

describe('Logger:', () => {
	it('global() returns singleton', () => {
		const x = Logger.global();
		const y = Logger.global();
		assert.strictEqual(x, y);
	});
});
