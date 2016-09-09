/**
 * Register a callback to be launched when the element is visible
 * @param  {element}   elm The element to observe
 * @param  {Function} cb  The callback to launch
 * @return {[type]}       [description]
 */
import __isInViewport from './isInViewport'
import __throttle from '../functions/throttle'

export default function whenOutOfViewport(elm, cb = null) {
	return new Promise((resolve, reject) => {
		let isInViewport = true,
			_cb = () => {
				if ( ! isInViewport) {
					document.removeEventListener('scroll', checkViewport);
					window.removeEventListener('resize', checkViewport);
					if (cb)	cb(elm);
					resolve(elm);
				}
			}
		let checkViewport = __throttle((e) => {
			isInViewport = __isInViewport(elm, { top:50, right:50, bottom:50, left:50 });
			_cb();
		},100);

		// listen for resize
		document.addEventListener('scroll', checkViewport);
		window.addEventListener('resize', checkViewport);
		setTimeout(() => {
			checkViewport(null);
		});
	});
}