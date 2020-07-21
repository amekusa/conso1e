(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.conso1e = factory());
}(this, (function () { 'use strict';

	const modes = {
		NORMAL: 0,
		SILENT: 1,
		BUFFER: 2
	};

	/**
	 * Stateful Console Logger
	 * @author amekusa.com
	 */
	class Logger {
		constructor(...args) {
			this._core = args.length ? new console.Console(...args) : console;
			this._mode = modes.NORMAL;
			this.clearBuffers();
		}
		get core() {
			return this._core;
		}
		get isNormal() {
			return this._mode == modes.NORMAL;
		}
		get isSuppressed() {
			return this._mode == modes.SILENT;
		}
		get isBuffering() {
			return this._mode == modes.BUFFER;
		}
		get hasBuffer() {
			return this._buffers.length > 0;
		}
		clearBuffers() {
			this._buffers = [];
			return this;
		}
		suppress(buffer = false) {
			this._mode = buffer ? modes.BUFFER : modes.SILENT;
			return this;
		}
		unsuppress(flush = true) {
			this._mode = modes.NORMAL;
			if (flush) this.flush();
			return this;
		}
		/**
		 * Buffers a single console output
		 * @param  {string} method Output method (ex. log, debug, error)
		 * @param  {any...} args...
		 */
		buffer(method, ...args) {
			this._buffers.push({ method: method, args: args });
			return this;
		}
		/**
		 * Unbuffers the last console output
		 */
		unbuffer() {
			if (!this.hasBuffer) return false;
			let buf = this._buffers.pop();
			return this._do(buf.method, ...buf.args);
		}
		/**
		 * Unbuffers all the console outputs
		 */
		flush() {
			if (!this.hasBuffer) return false;
			for (let buf of this._buffers) this._do(buf.method, ...buf.args);
			return this.clearBuffers();
		}
		do(method, ...args) {
			if (this.isNormal) return this._do(method, ...args);
			if (this.isBuffering) this.buffer(method, ...args);
			return this;
		}
		_do(method, ...args) {
			this._core[method](...args);
			return this;
		}
	}

	// Wrap all the console methods
	for (let prop in console) {
		if (Logger.prototype[prop] !== undefined) continue;
		if (Logger.prototype['_'+prop] !== undefined) continue;
		if (typeof console[prop] != 'function') continue;
		Logger.prototype[prop] = function (...args) { return this.do(prop, ...args) };
		Logger.prototype['_'+prop] = function (...args) { return this._do(prop, ...args) };
	}

	let instance;
	Logger.global = function () {
		if (!instance) instance = new Logger();
		return instance;
	};

	Logger.create = function (...args) {
		return new Logger(...args);
	};

	Logger.wrap = function (core) {
		if (typeof core != 'object') throw new Error('Invalid Argument');
		const r = new Logger();
		r._core = core;
		return r;
	};

	return Logger;

})));
