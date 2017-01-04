'use strict';

exports.__esModule = true;
exports.default = whenInViewport;

var _whenVisible = require('./whenVisible');

var _whenVisible2 = _interopRequireDefault(_whenVisible);

var _isInViewport = require('./isInViewport');

var _isInViewport2 = _interopRequireDefault(_isInViewport);

var _throttle = require('../utils/functions/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _closest = require('./closest');

var _closest2 = _interopRequireDefault(_closest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Monitor an HTMLElement to be notified when it is in the viewport
 *
 * @name 		whenInViewport
 * @param 		{HTMLElement} 				elm 		The element to monitor
 * @param 		{Function} 					[cb=null] 	An optional callback to call when the element is in the viewport
 * @return 		(Promise) 								The promise that will be resolved when the element is in the viewport
 *
 * @example 	js
 * import whenInViewport from 'sugarcss/js/dom/whenInViewport'
 * whenInViewport(myCoolHTMLElement).then((elm) => {
 * 		// do something with your element that has entered the viewport...
 * });
 *
 * @author 		Olivier Bossel <olivier.bossel@gmail.com>
 */
function whenInViewport(elm) {
	var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	return new Promise(function (resolve, reject) {

		// try to get the closest element that has an overflow
		var scrollContainerElm = document;
		if (!elm._inViewportContainer) {
			var overflowContainer = (0, _closest2.default)(elm, '[data-in-viewport-container]');
			if (overflowContainer) {
				scrollContainerElm = overflowContainer;
				elm._inViewportContainer = overflowContainer;
			}
		} else {
			scrollContainerElm = elm._inViewportContainer;
		}

		console.log('whenInViewport', elm, scrollContainerElm);

		var isInViewport = false,
		    isVisible = false,
		    _cb = function _cb() {
			if (isVisible && isInViewport) {
				scrollContainerElm.removeEventListener('scroll', checkViewport);
				window.removeEventListener('resize', checkViewport);
				if (cb) cb(elm);
				resolve(elm);
			}
		};
		var checkViewport = (0, _throttle2.default)(function (e) {
			isInViewport = (0, _isInViewport2.default)(elm, 50);
			_cb();
		}, 100);

		// detect when visible
		(0, _whenVisible2.default)(elm).then(function (elm) {
			isVisible = true;
			_cb();
		});

		// listen for resize
		scrollContainerElm.addEventListener('scroll', checkViewport);
		window.addEventListener('resize', checkViewport);
		setTimeout(function () {
			checkViewport(null);
		});
	});
}