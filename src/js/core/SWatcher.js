import __constructorName from '../tools/constructorName'
let _get = require('lodash/get');
import _set from 'lodash/set';

export default class SWatcher {

	/**
	 * Setters methods
	 */
	static setters = {
		CSSStyleDeclaration : (obj, property, value) => {
			obj.setProperty(property, value);
		}
	}

	/**
	 * Watch stack
	 */
	_watchStack = {};

	/**
	 * Constructor
	 */
	constructor() {
	}

	_defineProp(obj, property, value, objPath) {

		// do not define multiple time the description
		if (this._watchStack[objPath]) return;

		// store the current value
		let val = value;
		let descriptor = Object.getOwnPropertyDescriptor(obj.prototype || obj, property);

		// custom setter check
		const _set = (value) => {
			// check if have a custom setter for this object
			if (customSetter) {
				customSetter(obj, property, value);
				val = value;
			}
			// descriptor
			else if (descriptor && descriptor.set) {
				let ret = descriptor.set(value);
				if (ret) {
					val = ret;
				} else {
					val = descriptor.get();
				}
			} else {
				val = value;
			}

			// apply the proxy for arrays, etc...
			val = this.applyProxy(val, objPath, (newVal) => {
				val = newVal;
			});
		}

		// get the setter
		let customSetter;
		for (let name in SWatcher.setters) {
			if (__constructorName(obj) === name) {
				customSetter = SWatcher.setters[name];
				break;
			}
		}

		// set the value
		_set(value);

		// make sure we have the good descriptor
		let d = Object.getOwnPropertyDescriptor(obj, property);
		Object.defineProperty(obj, property, {
			get : () => {
				let _val = val;
				if (descriptor && descriptor.get) {
					_val = descriptor.get();
				}
				return _val;
			},
			set : (v) => {
				const oldValue = val;
				// internal set to use the good setter
				_set(v);
				// notify of new update
				this.notify(objPath, val, oldValue);
			},
			configurable : descriptor && descriptor.configurable !== undefined ? descriptor.configurable : false,
			enumarable : descriptor && descriptor.enumarable !== undefined ? descriptor.enumarable : true,
			// writable : descriptor && descriptor.writable !== undefined ? descriptor.writable : true
		});
	}

	/**
	 * Apply a proxy on the variable to detect changes
	 * on arrays, etc...
	 */
	applyProxy(value, objPath, setValueCb) {
		const _this = this;
		// if is an array
		if (value instanceof Array) {
			const oldVal = value.slice(0);
			const originalPush = Array.prototype.push;
			value.push = function() {
				// apply the push
				const ret = Array.prototype.push.apply(this,arguments);
				// set value callback
				setValueCb(value);
				// notify
				_this.notify(objPath, this, oldVal);
				// return the new value
				return ret;
			}
		}
		return value;
	}

	/**
	 * Watch something on the element
	 */
	watch(object, path, cb) {
		// check if the path parameter has already a descriptor
		const split = path.split('.');
		let obj = object;
		let property = null;
		if (split.length > 1) {
			property = split.pop();
			obj = _get(object, split.join('.'));
		} else {
			property = split[0];
		}
		let currentValue = null;
		currentValue = _get(object, path);

		// if is undefined, throw an error
		if ( obj === undefined || currentValue === undefined) {
			// _set(this, split.join('.'),null);
			throw `It's not possible to watch the property ${path} cause it does not exist...`;
		};

		// define the property proxy
		this._defineProp(obj, property, currentValue, path);

		// register new watch
		if ( ! this._watchStack[path]) {
			this._watchStack[path] = [];
		}
		this._watchStack[path].push(cb);
	}

	/**
	 * Tell that something has changed
	 */
	notify(path, newValue, oldValue) {
		if (this._watchStack[path] && newValue !== oldValue) {
			this._watchStack[path].forEach((cb) => {
				cb(newValue, oldValue);
			});
		}
	}
}