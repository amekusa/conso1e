const MODES = {
	NORMAL: 0,
	SILENT: 1,
	BUFFER: 2
};

// Global instance
let instance;

/**
 * Stateful Console Logger
 * @author amekusa.com
 */
class Logger {
	constructor(...args) {
		this._core = args.length ? new console.Console(...args) : null;
		this._mode = MODES.NORMAL;
		this._buffers = [];
		this._parent = null;
		this._options = {};
	}
	get core() {
		if (this._core) return this._core;
		return this._parent ? this._parent.core : Logger.defaultCore;
	}
	get parent() {
		return this._parent;
	}
	get options() {
		return this._options;
	}
	get isNormal() {
		return this._mode == MODES.NORMAL;
	}
	get isSuppressed() {
		return this._mode != MODES.NORMAL;
	}
	get isBuffering() {
		return this._mode == MODES.BUFFER;
	}
	get hasBuffer() {
		return this._buffers.length > 0;
	}
	/**
	 * Sets or returns an option
	 * @param {string} name
	 * @param {any} value=undefined
	 */
	option(name, value = undefined) {
		if (arguments.length < 2) return this._options[name];
		this._options[name] = value;
		return this;
	}
	/**
	 * Creates and returns a subcontext
	 * @return {Logger}
	 */
	subcontext() {
		let r = new Logger();
		r._parent = this;
		return r;
	}
	clearBuffers() {
		this._buffers = [];
		return this;
	}
	suppress(buffer = false) {
		this._mode = buffer ? MODES.BUFFER : MODES.SILENT;
		return this;
	}
	unsuppress(flush = true) {
		this._mode = MODES.NORMAL;
		if (flush) this.flush();
		return this;
	}
	/**
	 * Buffers a single console output
	 * @param {string} method Output method (ex. log, debug, error)
	 * @param {object} options
	 * @param {any...} args...
	 */
	buffer(method, options, ...args) {
		this._buffers.push({ method, options, args });
		return this;
	}
	/**
	 * Unbuffers the last console output
	 */
	unbuffer() {
		if (!this.hasBuffer) return this;
		let buf = this._buffers.pop();
		return this.do(buf.method, buf.options, ...buf.args);
	}
	/**
	 * Unbuffers all the console outputs
	 */
	flush() {
		if (!this.hasBuffer) return this;
		for (let buf of this._buffers) this.do(buf.method, buf.options, ...buf.args);
		return this.clearBuffers();
	}
	do(method, options, ...args) {
		let _options = Object.assign(this._options, options);
		if (this.isNormal || _options.forceOutput) {
			return this._parent ?
				this._parent.do(method, _options, ...args) :
				this._do(method, _options, ...args);
		} else if (this.isBuffering) this.buffer(method, options, ...args);
		return this;
	}
	_do(method, options, ...args) {
		if (options.label && args.length) {
			if (['log', 'info', 'debug', 'warn', 'error', 'exception'].includes(method)) {
				if (typeof args[0] == 'string') args[0] = options.label+' '+args[0];
				else args.unshift(options.label);
			}
		}
		this.core[method](...args);
		return this;
	}
	static global() {
		if (!instance) instance = new Logger();
		return instance;
	}
	static create(...args) {
		return new Logger(...args);
	}
	static wrap(core) {
		if (typeof core != 'object') throw new Error('invalid argument');
		let r = new Logger();
		r._core = core;
		return r;
	}
}

// Save the global console as the default core
Logger.defaultCore = console;

// Wrap all the console methods
for (let prop in console) {
	if (typeof console[prop] != 'function') continue;
	if (Logger.prototype[prop] !== undefined) continue;
	if (Logger.prototype['_'+prop] !== undefined) continue;
	Logger.prototype[prop] = function (...args) { return this.do(prop, null, ...args) };
	Logger.prototype['_'+prop] = function (...args) { return this.do(prop, { forceOutput: true }, ...args) };
};

export default Logger;
