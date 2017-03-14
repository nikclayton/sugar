'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = autoCast;
/**
 * Auto cast the string into the correct variable type
 */
function autoCast(string) {
	// printed object
	if (string === '[object Object]') return null;
	// boolean values
	if (string === 'false' || string === 'true' || string === 'undefined' || string === 'null' || !isNaN(string)) {
		return eval(string);
	}
	// array
	if (typeof string === 'string' && string.substr(0, 1) === '[') {
		var val = eval(string);
		if (val instanceof Array) return val;
	}
	// parse json
	if (typeof string === 'string' && string.substr(0, 1) === '{') {
		return eval('(' + string + ')');
	}
	// return the string if nothing can be casted
	return string;
}