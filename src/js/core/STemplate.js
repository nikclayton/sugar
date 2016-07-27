import mustache from 'mustache';
import SWatcher from './SWatcher';
import SBinder from './SBinder';
import uniqid from '../tools/uniqid';
import morphdom from 'morphdom';
import domReady from '../dom/domReady';
import __autoCast from '../string/autoCast';
import __matches from '../dom/matches';

export default class STemplate {

	/**
	 * List of elements to never discard on render
	 */
	static doNotDiscard = [
		'.s-range',
		'.s-select',
		'.s-radiobox'
	];

	/**
	 * templateClassId
	 * Store a uniq id that will be used as identifier for
	 * this particular class in the window.sTemplateClasses
	 */
	templateClassId = null;

	/**
	 * refs
	 */
	refs = {};

	/**
	 * dom
	 * Store the reference to the created dom structure
	 */
	dom = null;

	/**
	 * Links
	 */
	bindings = {};

	/**
	 * Update timeout
	 */
	updateTimeout = null;

	/**
	 * Settings
	 */
	settings = {

		/**
		 * render
		 * A render function to process the template
		 * @type 	{Function}
		 */
		render : null

	};

	/**
	 * Constructor
	 */
	constructor(template, data = {}, settings = {}) {

		// save settings
		this.settings = {
			...this.settings,
			...settings
		};

		// check template type
		this.template = template;
		if (template.nodeName !== undefined) {
			const cont = document.createElement('div');
			cont.appendChild(template.cloneNode(true));
			this.template = cont.innerHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
		}
		this.data = data;

		// bound the class into the window to be apple to call it into
		// templates
		if ( ! window.sTemplateDataObjects) window.sTemplateDataObjects = {};
		this.templateClassId = `s-template-${uniqid()}`;
		window.sTemplateDataObjects[this.templateClassId] = this.data;

		// instanciate a watcher
		this.watcher = new SWatcher();
		this.binder = new SBinder();

		// watch each data
		for (let name in this.data) {
			const value = this.data[name];
			this.watcher.watch(this.data, name, (newVal, oldVal) => {
				// make update only once
				// by waiting next loop
				clearTimeout(this.updateTimeout);
				this.updateTimeout = setTimeout(() => {
					// render the template again
					this._internalRender();
				});
			});
		}

		// create the container
		this.dom = document.createElement('div');
		if (template.nodeName !== undefined) {
			this.dom = template;
		}

		// render first time
		this._internalRender();
	}

	/**
	 * Render the template
	 */
	render(template, data) {
		return template;
	}

	/**
	 * Render the template
	 */
	_internalRender() {
		// render the template
		let rendered = '';
		if (this.settings.render) {
			rendered = this.settings.render(this.template, this.data);
		} else {
			rendered = this.render(this.template, this.data);
		}
		// process rendered template
		rendered = this.processOutput(rendered);
		// set the new html
		morphdom(this.dom, rendered.trim(), {
			onBeforeElChildrenUpdated : (node) => {
				if (node.hasAttribute('s-template-no-child-update')) return false;
				return true;
			},
			onBeforeElUpdated : (node) => {
				if (node.hasAttribute('s-template-no-update')) return false;
				return true;
			},
			onBeforeNodeDiscarded : (node) => {
				// check if the node match one of the element selector
				// to not discard
				if (node.hasAttribute('s-template-no-discard')) return false;
				for(let i=0; i<STemplate.doNotDiscard.length; i++) {
					if (__matches(node, STemplate.doNotDiscard[i])) {
						// do not discard the element
						return false;
					}
				}
				return true;
			}
		});
		// update refs
		this.updateRefs();
		// listen for changes of datas in the DOM
		// through the s-template-model attribute
		this.listenDataChangesInDom();
	}

	/**
	 * Update references
	 */
	updateRefs() {
		// reset refs
		this.refs = {};
		// save the element itself
		this.refs.elm = this.dom;
		// search for name and id's
		[].forEach.call(this.dom.querySelectorAll('[id],[name]'), (elm) => {
			// get the id or name
			const id = elm.id || elm.getAttribute('name');
			// save the reference
			this.refs[id] = elm;
		});
	}

	/**
	 * Listen for changes of datas in dom
	 */
	listenDataChangesInDom() {
		// find elements that have a data binded into it
		[].forEach.call(this.dom.querySelectorAll('[s-template-model]'), (elm) => {
			// check if already binded
			const model = elm.getAttribute('s-template-model');
			if ( ! elm._sTemplateBinded) {
			 	elm._sTemplateBinded = true;
				elm.addEventListener('change', (e) => {
					// update the data accordingly
					this.data[model] = __autoCast(e.target.value);
				});
			 }

			 // set the initial value coming from the model
			 elm.value = this.data[model];
			 elm.setAttribute('value', this.data[model]);
		});
	}

	/**
	 * Append to
	 */
	appendTo(element) {
		element.appendChild(this.dom);
	}

	/**
	 * Remove the template from the dom
	 */
	remove() {
		this.dom.parentNode.removeChild(this.dom);
	}

	/**
	 * Process output
	 */
	processOutput(renderedTemplate) {
		let ret = renderedTemplate;

		// replace all the this. with the proper window.sTemplateDataObjects reference
		const thisDotReg = new RegExp('this\\.','g');
		ret = ret.replace(thisDotReg, `window.sTemplateDataObjects['${this.templateClassId}'].`);
		// element regexp
		const dollarElementReg = new RegExp('\\$element','g');
		ret = ret.replace(dollarElementReg, 'this');


		// select reg
		// let match = null;
		// const modelReg = new RegExp(' model="([^"]*)"','g');
		// const optionsReg = new RegExp('(<option\\b[^>]*>[\\s\\S]*?<\\/option>)','gm');
		// const selectReg = new RegExp('(<select\\b[^>]*>[\\s\\S]*?<\\/select>)','gm');
		// ret = ret.replace(selectReg, (item) => {
		//
		// 	let model = null;
		//
		// 	// manage model
		// 	item = item.replace(modelReg, (itm) => {
		// 		const value = itm.split('"')[1];
		// 		model = eval(value);
		// 		return ` onChange="${value} = this.value"`;
		// 	});
		//
		// 	// manage selected value
		// 	item = item.replace(optionsReg, (opt) => {
		// 		const value = opt.match(/value="(.*)"/);
		// 		opt = opt.replace('selected','');
		// 		if (value && value[1]) {
		// 			if (value[1] === model) {
		// 				opt = opt.replace('<option', '<option selected');
		// 			}
		// 		}
		// 		return opt;
		// 	});
		//
		// 	return item;
		// });


		// const optionReg = new RegExp('<option ','g');
		// return the processed template
		return ret;
	}

}
