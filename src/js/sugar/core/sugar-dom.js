import * as sugarTools from './sugar-tools'
let MutationSummary = require('mutation-summary');
let _get = require('lodash/get');
let _insertAnimationListener = false;
let _insertMutationObserver = null;
let _insertDomElementsCallbacks = {};

let sugarDom = {

	/**
	 * Polyfill for the matches js method
	 */
	matches : (el, selector) => {
		var p = Element.prototype;
		var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
			return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
		};
		return f.call(el, selector);
	},

	/**
	 * Make a selector detectable when new element are pushed in the page
	 */
	onInserted : (selector, cb) => {

		// use the animation hack to detect
		// new items in the page
		let detection_id = 's-insert-detection-'+sugarTools.uniqid();

		// add the callback in stack
		_insertDomElementsCallbacks[detection_id] = {
			callback : cb,
			selector : selector
		};
		
		// check how we can detect new elements
		if (window.MutationObserver != null && ! _insertMutationObserver) {
			// make use of great mutation summary library
			var observer = new MutationSummary({
				callback: (summaries) => {
					summaries.forEach((summary) => {
						summary.added.forEach((elm) => {
							cb(elm);
						});
					});
				},
				queries: [{ element: selector }]
			});

			// _insertMutationObserver = new MutationObserver((mutations) => {
			// 	// check if what we need has been added
			// 	mutations.forEach((mutation) => {
			// 		if (mutation.addedNodes && mutation.addedNodes[0]) {
			// 			// loop on each callbacks to find a match
			// 			for(let insert_id in _insertDomElementsCallbacks) {
			// 				if (this.matches(mutation.addedNodes[0], _insertDomElementsCallbacks[insert_id].selector)) {
			// 					_insertDomElementsCallbacks[insert_id].callback(mutation.addedNodes[0]);
			// 				}
			// 			}
			// 		}
			// 	});
			// });
			// _insertMutationObserver.observe(document.body, {
			// 	childList: true
			// });
		} else {
			// add the animation style in DOM
			let css = selector + ` { 
				-webkit-animation:${detection_id} 0.001s;
				-moz-animation:${detection_id} 0.001s;
				-ms-animation:${detection_id} 0.001s;
				animation:${detection_id} 0.001s;
			}
			@keyframes ${detection_id} {
				from { opacity: .99; }
				to { opacity: 1; }
			}`;
			let style = document.createElement('style');
			style.type = 'text/css';
			if (style.styleSheet) {
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(document.createTextNode(css));
			}
			document.head.appendChild(style);
			// now we listen for animation end
			// but only once
			if (! _insertAnimationListener) {
				_insertAnimationListener = true;
				document.addEventListener('animationend', (e) => {
					if (_insertDomElementsCallbacks[e.animationName]) {
						_insertDomElementsCallbacks[e.animationName].callback(e.target);
					}
				});
			}
		}
	},

	/**
	 * Dom ready
	 */
	domReady : (cb) => {
		// if (document.readyState == 'complete') {
		// 	console.log('ready!!!');
		// 	console.log(document.body);
		// 	cb();
		// } else {
		document.addEventListener('DOMContentLoaded', (e) => {
			cb();
		});
		// }	
	},

	/**
	 * Access dataset
	 */
	dataset : (elm, key, value = null) => {
		if ( ! elm.getAttribute) return;
		if ( ! value) {
			// try to get
			let v = _get(elm, 'dataset.'+key);
			if (v) return v;
			v = elm.getAttribute('data-'+sugarTools.uncamelize(key));
			return v;
		} else {
			// try to set the value
			if (_get(elm, 'dataset')) {
				if (_get(elm, 'dataset.'+key)) {
					elm.dataset[key] = value;
				} else {
					// set the data through setAttribute
					elm.setAttribute('data-'+sugarTools.uncamelize(key), value);
				}
			} else {
				// set the data through setAttribute
				// cause no support for dataset
				elm.setAttribute('data-'+sugarTools.uncamelize(key), value);
			}

		}
	},

	/**
	 * Get offset of an element
	 */
	offset : (elm) => {
		let body, box, clientLeft, clientTop, docEl, left, scrollLeft, scrollTop, top, transX, transY;
		box = elm.getBoundingClientRect();
		body = document.body;
		docEl = document.documentElement;
		scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
		scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
		clientTop = docEl.clientTop || body.clientTop || 0;
		clientLeft = docEl.clientLeft || body.clientLeft || 0;
		transX = sugarDom.getTranslate(elm, 'x');
		transY = sugarDom.getTranslate(elm, 'y');
		top = box.top + scrollTop - clientTop + transY;
		left = box.left + scrollLeft - clientLeft + transX;
		return {
			top: Math.round(top),
			left: Math.round(left)
		};
	},

	/**
	 * Get element translate values
	 */
	getTranslate : (elm, what) => {
		if ( ! window.getComputedStyle) return;
		let idx, mat, style, transform;
		style = getComputedStyle(elm);
		transform = style.transform || style.webkitTransform || style.mozTransform;
		mat = transform.match(/^matrix3d\((.+)\)$/);
		if (mat) {
			idx = {
				x: 12,
				y: 13,
				z: 14
			};
			return parseFloat(mat[1].split(', ')[idx[what]]);
		}
		mat = transform.match(/^matrix\((.+)\)$/);
		idx = {
			x: 4,
			y: 5,
			z: 6
		};
		if (mat) {
			return parseFloat(mat[1].split(', ')[idx[what]]);
		} else {
			return 0;
		}
	},

	/**
	 * Get closest 
	 */
	closest : (elm, selector) => {
		elm = elm.parentNode;
		while(elm && elm != document) {
			if (sugarDom.matches(elm, selector)) {
				return elm;
			}
			elm = elm.parentNode;
		}
		return false;
	},

	/**
	 * Classes helpers
	 */
	hasClass : (elm, cls) => {
		return elm.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	},
	addClass : (elm, cls) => {
		if (!sugarDom.hasClass(elm, cls)) {
			return elm.className += ' ' + cls;
		}
	},
	removeClass : (elm, cls) => {
		let reg;
		if (sugarDom.hasClass(elm, cls)) {
			reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
			return elm.className = elm.className.replace(reg, ' ');
		}
	}
}

export default sugarDom;