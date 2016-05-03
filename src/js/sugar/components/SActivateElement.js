/*
 * Sugar-activate.js
#
 * This little js file allow you to detect when an element has been inserted in the page in conjunction with the scss mixin
#
 * @author   Olivier Bossel <olivier.bossel@gmail.com>
 * @created  20.01.16
 * @updated  20.01.16
 * @version  1.0.0
 */
import SComponent from '../core/SComponent'
import __scrollTop from '../dom/scrollTop'

// save all the activate elements
if ( ! window._sActivateStack) {
	window._sActivateStack = {};
}

// Actual activate element class
class SActivateElement extends SComponent {

	/**
	 * Setup
	 */
	static setup(type, settings, name = 'sActivate') {
		SComponent.setup(name, type, settings);
	}

	/**
	 * Constructor
	 */
	constructor(elm, settings = {}, name = 'sActivate') {
		super(name, elm, {
			target : '@',
			group : null,
			activeClass : 'active',
			history : true,
			anchor : true,
			toggle : false,
			trigger : 'click',
			unactivateTrigger : null,
			unactivateTimeout : 200,
			preventScroll : true
		}, settings);

		this._inited = true;
		this._tabs = {};

		// init
		this.init();
	}

	/**
	 * Init
	 */
	init() {
		if (this.inited) {
			return;
		}
		this.inited = true;
		
		// get the target
		this.target = this.settings.target || this.elm.getAttribute('href');

		// save in stack
		window._sActivateStack[this.target] = this;

		// update references
		this.update();

		// handle history if needed
		if (this.settings.history) {
			this._handleHistory();
		}

		// managing group
		if (! this._getGroup(this.elm)) {
			[].forEach.call(this.elm.parentNode.childNodes, (sibling) => {
				if ( ! this._getGroup(this.elm) && sibling.nodeName != '#text' && sibling.nodeName != '#coment') {
				// if ( ! this.dataset(`${this.name}Group`)) {
					let target = this._getTarget(sibling);
					if (target) {
						let sibling_grp = this._getGroup(sibling);
						if (sibling_grp && sibling.sActivateGeneratedGroup) {
							// this._getGroup(this.elm) = sibling_grp;
							this.elm.setAttribute(this.name_dash+'-group', sibling_grp);
							// this.dataset(`${this.name}Group`, sibling_grp);
						}
					}
				}
			});

			// if we don't have any group yet
			if ( ! this._getGroup(this.elm)) {
			// if ( ! this.dataset(`${this.name}Group`)) {
				this.elm.setAttribute(this.name_dash+'-group','group-'+Math.round(Math.random()*99999999));
				// this.dataset(`${this.name}Group`, 'group-'+Math.round(Math.random()*99999999));
				this.elm.sActivateGeneratedGroup = true;
			}
		}

		// check if we are in another s-activate element
		let closest = this._getClosestActivate();

		if (closest) {
			// save the closest content reference
			this.parentActivate = document.body.querySelector(`[data-${this.name_dash}="${closest.id}"],[${this.name_dash}="${closest.id}"],[data-${this.name_dash}][href="#${closest.id}"],[${this.name_dash}][href="#${closest.id}"]`);
			// this.parentActivate = document.body.querySelector('[data-s-activate="'+closest.id+'"],[s-activate="'+closest.id+'"]');
			// console.log(this.parentActivate);
		}

		// listen for click
		this.elm.addEventListener(this.settings.trigger, (e) => {
			e.preventDefault();
			// clear unactivate timeout
			clearTimeout(this._unactivateSetTimeout);
			// if toggle
			if (this.settings.toggle && this.isActive()) {
				// unactivate
				this.unactivate();
				// check if has a hash
				if (this.settings.history) {
					window.history.back();
				}
			} else {
				if (this.settings.history) {
					// simply activate again if the same id that anchor
					// this can happened when an element has history to false
					if (document.location.hash && document.location.hash == this.target) {
						this._activate();
					} else {
						// save the scroll position
						// this._scrollTop = __scrollTop();
						// simply change the hash 
						// the event listener will take care of activate the
						// good element
						if (this.settings.preventScroll) {
							// document.location.hash = `${this.target}/`;
							window.history.pushState(null,null,`${document.location.pathname}${this.target}`);
							this._processHistoryChange();
						} else {
							document.location.hash = `${this.target}`;
						}
					}
				} else {
					// activate the element
					this._activate();
				}
			}	
		});
		// check if has an unactivate trigger
		let unactivate_trigger = this.settings.unactivateTrigger;
		if (unactivate_trigger) {
			this.elm.addEventListener(unactivate_trigger, (e) => {
				this._unactivateSetTimeout = setTimeout(() => {
					this.unactivate();
				}, this.settings.unactivateTimeout);		
			});
			if (unactivate_trigger == 'mouseleave' || unactivate_trigger == 'mouseout') {
				[].forEach.call(this.targets, (target) => {
					target.addEventListener('mouseenter', (e) => {
						// clear the unactivate timeout
						clearTimeout(this._unactivateSetTimeout);
					});
					target.addEventListener(unactivate_trigger, (e) => {
						this._unactivateSetTimeout = setTimeout(() => {
							this.unactivate();
						}, this.settings.unactivateTimeout);	
					});
				});
			}
		}

		// if the element has the active class
		if (this.elm.classList.contains('active')) {
			this._activate();
		}

		// if need to handle anchor
		if (this.settings.anchor) {
			let hash = document.location.hash;
			if (hash) {
				if (hash == this.target) {
					this._activate();
				}
			}
		}
	}

	/**
	 * Get target
	 */
	_getTarget(elm) {
		if (elm[this.name]) {
			return elm[this.name].target;
		}
		return elm.getAttribute(`data-${this.name_dash}`) || elm.getAttribute(this.name_dash) || elm.getAttribute('href');
	}

	/**
	 * Get group
	 */
	_getGroup(elm) {
		return elm.getAttribute(this.name_dash+'-group') || elm.getAttribute('data-'+this.name_dash+'-group');
	}

	/**
	 * Check if is active
	 */
	isActive() {
		return this.elm.classList.contains('active');
	}

	/**
	 * Activate the element
	 */
	_activate() {

		// unactive all group elements
		let grp = this._getGroup(this.elm);
		[].forEach.call(document.body.querySelectorAll(`[data-${this.name_dash}-group="${grp}"],[${this.name_dash}-group="${grp}"]`), (group_elm) => {
			// get the api
			let api = group_elm.sActivate;
			// unactive element
			if (api) {
				api.unactivate();
			}
		});

		// activate the element
		this.elm.classList.add('active');

		// activate all the targets
		[].forEach.call(this.targets, (target_elm) => {
			// remove the active class on target
			target_elm.classList.add('active');
		});

		// if has a perent, activate it
		if (this.parentActivate) {
			let parent_api = this.parentActivate[this.name];
			if (parent_api) {
				console.log('activate parent', parent_api);
				parent_api._activate();
			}
		}
	}

	/**
	 * Handle history
	 */
	_handleHistory() {
		if ( ! this.settings.preventScroll) {
			window.addEventListener('hashchange', (e) => {
				this._processHistoryChange();
			});
		} else {
			window.addEventListener('popstate', (e) => {
				this._processHistoryChange();
			});
		}
	}

	/**
	 * Process history change
	 */
	_processHistoryChange() {
		let hash = document.location.hash;
		if (hash) {
			if (hash == this.target) {
				this._activate();
			}
		}
	}

	/**
	 * Activate the element
	 */
	activate() {
		if (this.settings.history) {
			if (this.settings.preventScroll) {
				window.history.pushState(null,null,`${document.location.pathname}#${this.target}`);
				this._processHistoryChange();
			} else {
				document.location.hash = this.target;
			}
		} else {
			// activate simply
			this._activate();
		}
	}

	/**
	 * Unactive
	 */
	unactivate() {
		// unactive the item itself
		this.elm.classList.remove('active');

		// unactive targets
		[].forEach.call(this.targets, (target) => {
			target.classList.remove('active');
		});
	}

	/**
	 * Update targets, etc...
	 */
	update(scope = document.body) {
		this.targets = scope.querySelectorAll(this.target);
	}

	/**
	 * Get closest 
	 */
	_getClosestActivate() {
		let elm = this.elm.parentNode;
		while(elm && elm != document) {
			if (elm.id && window._sActivateStack[elm.id]) {
				return elm;
			}
			elm = elm.parentNode;
		}
		return false;
	}
}

// expose in window.sugar
if (window.sugar == null) { window.sugar = {}; }
window.sugar.SActivateElement = SActivateElement;

// export
export default SActivateElement;