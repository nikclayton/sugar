import SComponent from '../core/SComponent'
import Pikaday from 'pikaday-time'
import sSettings from '../core/sSettings'
import __querySelectorVisibleLiveOnce from '../dom/querySelectorLive';

// Date picker
class SDatepickerComponent extends SComponent {

	/**
	 * Setup
	 */
	static setup(type, settings) {
		SComponent.setup('sDatepicker', type, settings);
	}

	/**
	 * Constructor
	 */
	constructor(elm, settings = {}, name='sDatepicker') {
		super(name, elm, {
			from : null,
			to : null,
			numberOfMonths : 1,
			autoFocus : true
		}, settings);

		// init
		this.initProxy(this._init.bind(this));
	}

	/**
	 * Init
	 */
	_init() {
		// try to get the theme automatically
		let theme = null;
		// console.warn('settings', sSettings);

		if (sSettings.colors) {
			for (let prop in sSettings.colors) {
				// console.log('PROP', this.elm.classList);
				if (this.elm.classList.contains(prop)
					|| this.elm.classList.contains('input--'+prop)) {
					theme = prop;
					break;
				}
			}
		}

		// check if a "from" is specified
		let from = this.settings.from;
		if (from) {
			const fromElm = document.querySelector(from);
			if ( ! fromElm)
				throw `SDatepickerComponent => You have specified the "from" setting but no element match the "${from}" selector`;
			// listen for change on the input
			fromElm.addEventListener('change', (e) => {
				// check if we have the pikaday instance
				if (e.target.sDatepicker && e.target.sDatepicker.picker) {
					// get the picker date
					let date = e.target.sDatepicker.picker.getDate();
					this.picker.setStartRange(date);
					this.picker.setMinDate(date);
					e.target.sDatepicker.picker.setStartRange(date);
					e.target.sDatepicker.picker.hide();
					e.target.sDatepicker.picker.show();
				}
			});
		}

		// check if a "to" is specified
		let to = this.settings.to;
		if (to) {
			const toElm = document.querySelector(to);
			if ( ! toElm)
				throw `SDatepickerComponent => You have specified the "to" setting but no element match the "${to}" selector`;
			// listen for change on the input
			toElm.addEventListener('change', (e) => {
				// check if we have the pikaday instance
				if (e.target.sDatepicker && e.target.sDatepicker.picker) {
					// get the picker date
					let date = e.target.sDatepicker.picker.getDate();
					this.picker.setEndRange(date);
					this.picker.setMaxDate(date);
					e.target.sDatepicker.picker.setEndRange(date);
					e.target.sDatepicker.picker.hide();
					e.target.sDatepicker.picker.show();

				}
			});
			// auto focus
			if (this.settings.autoFocus) {
				this.elm.addEventListener('change', (e) => {
					console.log('e.', e.target);
					toElm.focus();
				});
			}
		}

		// init the picker
		this.picker = new Pikaday({...{
			field : this.elm,
			showTime : false,
			theme : theme,
			numberOfMonths : this.settings.numberOfMonths || 1
		}, ...this.settings});
	}
}

// initOn
SDatepickerComponent.initOn = function(selector, settings = {}) {
	// init the select
	return __querySelectorVisibleLiveOnce(selector).subscribe((elm) => {
		new SDatepickerComponent(elm, settings);
	});
};


// expose in window.sugar
if (window.sugar == null) { window.sugar = {}; }
window.sugar.SDatepickerComponent = SDatepickerComponent;

// export modules
export default SDatepickerComponent;