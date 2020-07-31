const assert = require('assert');
const stream = require('stream');
const Logger = require('./bundle');

function falsy(value) {
	return !!!value;
}

class TestStream extends stream.Writable {
	constructor(options) {
		super(options);
		this._chunks = [];
	}
	get data() {
		return Buffer.concat(this._chunks).toString('utf8');
	}
	_write(chunk, enc, next) {
		this._chunks.push(chunk);
		next();
	}
}

describe('Logger:', () => {
	let setup = () => {
		let r = {};
		r.log = new TestStream();
		r.errLog = new TestStream();
		r.logger = Logger.create(r.log, r.errLog);
		return r;
	};

	it('Default Core', () => {
		const logger = Logger.create();
		assert.ok(falsy(logger._core));
		assert.ok(logger.core);
		assert.strictEqual(logger.core, console);
	});
	it('global() returns singleton', () => {
		const x = Logger.global();
		const y = Logger.global();
		assert.strictEqual(x, y);
	});
	it('Overwriting the global console', () => {
		const original = console;
		console = Logger.create();
		assert.strictEqual(console.core, original);
		console = original;
	});
	it('Method Chaining', () => {
		const { log, errLog, logger } = setup();
		logger.log('A')
			.log('B')
			.error('ERR')
			.log('C');
		assert.equal(log.data, `A\nB\nC\n`);
		assert.equal(errLog.data, `ERR\n`);
	});
	it('Custom Console', () => {
		const log = new TestStream();
		const msg = 'this is .log output';
		const errLog = new TestStream();
		const errMsg = 'this is .error output';
		const logger = Logger.create(log, errLog);
		logger.log(msg).error(errMsg);
		assert.equal(log.data, msg+'\n');
		assert.equal(errLog.data, errMsg+'\n');
	});
	it('wrap()', () => {
		const log = new TestStream();
		const msg = 'this is .log output';
		const errLog = new TestStream();
		const errMsg = 'this is .error output';
		const myConsole = new console.Console(log, errLog);
		const logger = Logger.wrap(myConsole);
		logger.log(msg).error(errMsg);
		assert.equal(log.data, msg+'\n');
		assert.equal(errLog.data, errMsg+'\n');
	});
	it('Suppression', () => {
		const { log, logger } = setup();
		logger.log('A');
		logger.suppress();
		assert.ok(logger.isSuppressed);
		logger.log('XXX');
		logger.unsuppress();
		assert.ok(logger.isNormal);
		logger.log('B');
		assert.equal(log.data, 'A\nB\n');
	});
	it('Buffering', () => {
		const { log, logger } = setup();
		logger.log('A');
		logger.suppress(true);
		assert.ok(logger.isSuppressed);
		assert.ok(logger.isBuffering);
		logger.log('B');
		assert.equal(log.data, 'A\n');
		logger.unsuppress();
		assert.ok(logger.isNormal);
		assert.equal(log.data, 'A\nB\n');
		logger.log('C');
		assert.equal(log.data, 'A\nB\nC\n');
	});
	it('Bypassing', () => {
		const { log, logger } = setup();
		logger.log('A');
		logger.suppress();
		logger._log('B');
		logger.unsuppress();
		logger.log('C');
		assert.equal(log.data, 'A\nB\nC\n');
	});
	it('Label', () => {
		const { log, logger } = setup();
		logger.option('label', '[LABEL]');
		logger.log('ABC', 'DEF');
		assert.equal(log.data, '[LABEL] ABC DEF\n');
		logger.log({ X: 1, Y: 2 }, 'GHI', 'JKL');
		assert.equal(log.data, '[LABEL] ABC DEF\n[LABEL] { X: 1, Y: 2 } GHI JKL\n');
	});

	describe('Composition:', () => {
		let setup = () => {
			let r = {};
			r.log = new TestStream();
			r.errLog = new TestStream();
			r.logger = Logger.create(r.log, r.errLog);
			r.sub = r.logger.subcontext();
			return r;
		};

		it('Core Inheritance', () => {
			const { log, logger, sub } = setup();
			assert.ok(falsy(sub._core));
			assert.ok(sub.core);
			assert.strictEqual(sub.core, logger.core);
			sub.log(`ABC`);
			assert.equal(log.data, `ABC\n`);
		});
		it('Suppression', () => {
			const { log, logger, sub } = setup();
			sub.log(`A`);
			sub.suppress();
			assert.ok(sub.isSuppressed);
			logger.log(`B`);
			sub.log(`XXX`);
			sub.unsuppress();
			assert.ok(sub.isNormal);
			logger.log(`C`);
			sub.log(`D`);
			assert.equal(log.data, `A\nB\nC\nD\n`);
		});
		it('Suppression Inheritance', () => {
			const { log, logger, sub } = setup();
			logger.log(`A`);
			sub.log(`B`);
			logger.suppress();
			assert.ok(sub.isNormal);
			logger.log(`XXX`)
			sub.log(`XXX`);
			logger.unsuppress();
			logger.log('C');
			sub.log('D');
			assert.equal(log.data, `A\nB\nC\nD\n`);
		});
		it('Buffering', () => {
			const { log, logger, sub } = setup();
			sub.log(`A`);
			sub.suppress(true);
			assert.ok(sub.isSuppressed);
			assert.ok(sub.isBuffering);
			sub.log(`C`);
			logger.log(`B`);
			sub.unsuppress();
			assert.ok(sub.isNormal);
			assert.equal(log.data, `A\nB\nC\n`);
		});
		it('Buffering Inheritance', () => {
			const { log, logger, sub } = setup();
			logger.log(`A`);
			logger.suppress(true);
			assert.ok(sub.isNormal);
			sub.log(`B`);
			assert.equal(log.data, `A\n`);
			logger.unsuppress();
			assert.equal(log.data, `A\nB\n`);
		});
		it('Label', () => {
			const { log, logger, sub } = setup();
			sub.option('label', '[LABEL]');
			logger.log('ROOT');
			sub.log('SUB');
			assert.equal(log.data, `ROOT\n[LABEL] SUB\n`);
		});
		it('Label Inheritance', () => {
			const { log, logger, sub } = setup();
			logger.option('label', '[LABEL]');
			logger.log('ROOT');
			sub.log('SUB');
			assert.equal(log.data, `[LABEL] ROOT\n[LABEL] SUB\n`);
		});
		it('Label Override', () => {
			const { log, logger, sub } = setup();
			logger.option('label', '[LABEL]')
			sub.option('label', '[SUB_LABEL]');
			logger.log('ROOT');
			sub.log('SUB');
			assert.equal(log.data, `[LABEL] ROOT\n[SUB_LABEL] SUB\n`);
		});
	});
});
