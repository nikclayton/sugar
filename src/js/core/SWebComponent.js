import __autoCast from '../utils/string/autoCast'
import __camelize from '../utils/string/camelize'
import sSettings from './sSettings'
require('webcomponents.js');
import fastdom from 'fastdom'

export default class SWebComponent extends HTMLElement {

	/**
	 * Define the new web component
	 * @param 			{String} 			name 		The name of the component
	 * @param 			{SWebComponent} 	component 	The component class
	 */
	static define(name, component) {
		document.registerElement(name, component);
	}

	/**
	 * Store all the props of the component
	 * Props are actual computed props with attributes
	 * @type 		{Object}
	 * @default 	{}
	 */
	props = {};

	/**
	 * Constructor
	 */
	constructor() { super(); }

	/**
	 * Return the default props for the component.
	 * Need to take care of the passed props parameter and mix it at the
	 * end of your default props
	 *
	 * @example
	 * getDefaultProps(props = {}) {
	 * 		return super.getDefaultProps({
	 * 			myCoolProp : null,
	 * 			...props
	 * 		});
	 * }
	 *
	 * @author 		Olivier Bossel <olivier.bossel@gmail.com>
	 */
	get defaultProps() {
		return {};
	}
	getDefaultProps(props = {}) {
		return props;
	}

	/**
	 * Return an array of props to set on the dom
	 */
	physicalProps(props = {}) {
		return props;
	}

	/**
	 * Method called before the component will be added in the dom.
	 * You will not have access to the siblings, etc here.
	 * This is the place to init your component, just like a constructor
	 *
	 * @example
	 * componentWillMount() {
	 * 		// call parent method
	 * 		super.componentWillMount();
	 * 		// do something here...
	 * }
	 *
	 * @author 		Olivier Bossel <olivier.bossel@gmail.com>
	 */
	componentWillMount() {

		// internal properties
		this._nextPropsStack = {};
		this._prevPropsStack = {};
		this._nextPropsTimeout = null;
		this._componentMounted = false;

		// default props init
		this.props = this.getDefaultProps();
		// compute props
		this._computeProps();

		console.log('props', this.defaultProps);

	}

	/**
	 * Set properties
	 */
	setProps(props = {}) {
		// set each props
		for (let key in props) {
			this.setProp(key, props[key]);
		}
		return this;
	}

	/**
	 * Set a property
	 */
	setProp(prop, value) {

		// save the oldVal
		const _oldVal = this.props[prop];

		// stop if same value
		if (_oldVal === value) return;

		// set the prop
		this.props[prop] = value

		// handle physical props
		this._handlePhysicalProps(prop, value);

		// if the component is not mounted
		// we do nothing here...
		if ( ! this.isComponentMounted()) return;

		// create the stacks
		this._prevPropsStack[prop] = _oldVal;
		this._nextPropsStack[prop] = value;

		// component will receive prop
		if (this.componentWillReceiveProp) {
			this.componentWillReceiveProp(prop, value, _oldVal);
		}

		// clearTimeout(this._nextPropsTimeout);
		// this._nextPropsTimeout = setTimeout(() => {
		fastdom.mutate(() => {

			// create array version of each stacks
			const nextPropsArray = [],
				  prevPropsArray = [];
			for (let key in this._nextPropsStack) {
				const val = this._nextPropsStack[key];
				nextPropsArray.push({
					name : key,
					value : val
				});
			}
			for (let key in this._prevPropsStack) {
				const val = this._prevPropsStack[key];
				prevPropsArray.push({
					name : key,
					value : val
				});
			}

			// call the will reveiveProps if exist
			if (this.componentWillReceiveProps) {
				this.componentWillReceiveProps(this._nextPropsStack, nextPropsArray);
			}

			// should component update
			if (this.shouldComponentUpdate && ! this.shouldComponentUpdate(this._nextPropsStack, nextPropsArray)) return;

			// component will update
			this.componentWillUpdate(this._nextPropsStack, nextPropsArray);

			// render the component
			this.render();

			// component did update
			this.componentDidUpdate(this._prevPropsStack, prevPropsArray);

		});
	}

	/**
	 * Method called right after that the component has been added in the dom,
	 * and before the initial render
	 * This is the first place where you will have access to the dom.
	 *
	 * @example
	 * componentMount() {
	 * 		// call parent method
	 * 		super.componentMount();
	 * 		// do something here...
	 * }
	 *
	 * @author 		Olivier Bossel <olivier.bossel@gmail.com>
	 */
	componentMount() {
	}

	/**
	 * Method called after the initial component render
	 *
	 * @example
	 * componentDidMount() {
	 * 		// call parent method
	 * 		super.componentDidMount();
	 * 		// do something here...
	 * }
	 *
	 * @author 		Olivier Bossel <olivier.bossel@gmail.com>
	 */
	componentDidMount() {
	}

	/**
	 * Method called right before the render when some props have been updated.
	 * This method is not called before the initial render
	 *
	 * @param 		{Object} 		nextProps 			An object that represent the props that have been updated
	 * @param 		{Array} 		nextPropsArray 		An array representation of the nextProps object [{name:...,value:...}]
	 *
	 * @example
	 * componentWillUpdate() {
	 * 		// call parent method
	 * 		super.componentWillUpdate();
	 * 		// do something here...
	 * }
	 *
	 * @author 		Olivier Bossel <olivier.bossel@gmail.com>
	 */
	componentWillUpdate(nextProps) {
	}

	/**
	 * Apply all the updated that you need in the dom for the component to reflect the props
	 *
	 * @example
	 * render() {
	 * 		// call the parent method
	 * 		super.render();
	 * 		// apply some classes, properties, styles, etc... in the dom
	 * 		// in order to reflect the props object state
	 * }
	 *
	 * @author 		Olivier Bossel <olivier.bossel@gmail.com>
	 */
	render() {
	}

	componentDidUpdate(prevProps) {
	}

	componentWillUnmount() {
	}

	componentUnmount() {
	}

	componentDidUnmount() {
	}

	/**
	 * When the component is created
	 */
	createdCallback() {
		// component will mount
		this.componentWillMount();
	}

	/**
	 * When the element is attached
	 */
	attachedCallback() {
		// init
		this.componentMount();
		// render
		this.render();
		// component did mount
		this.componentDidMount();
		// update the status
		this._componentMounted = true;
	}

	/**
	 * When the component is detached
	 */
	detachedCallback() {
		// will unmount
		this.componentWillUnmount();
		// unmount
		this.componentUnmount();
		// did unmount
		this.componentDidUnmount();
		// update the status
		this._componentMounted = false;
	}

	/**
	 * When any of the component attribute changes
	 */
	attributeChangedCallback(attribute, oldVal, newVal) {

		const _attribute = attribute;

		// process the attribute to camelCase
		attribute = __camelize(attribute);

		// when the prop is false
		// and the element has not this attribute
		// we assume that the prop will stay to false
		if (this.props[attribute] === false
			&& ! this.hasAttribute(_attribute)) {
			return;
		}

		// if there's no new value but that the element has
		// the attribute on itself, we assume the newVal
		// is equal to true
		if ( ! this.props[attribute]
			&& newVal !== 'false'
			&& newVal !== 'null'
			&& this.hasAttribute(_attribute)
		) {
			this.setProp(attribute, true);
			return;
		}

		// update the props
		const val = __autoCast(newVal);

		// set the new prop
		this.setProp(attribute, val);
	}

	/**
	 * Check if component is mounted
	 * @return 			{Boolean} 			true if mounted, false if not
	 */
	isComponentMounted() {
		return this._componentMounted;
	}

	/**
	 * Handle physical props by setting or not the prop
	 * on the dom element as attribute
	 */
	_handlePhysicalProps(prop, value) {
		fastdom.mutate(() => {
			// check if is a physical prop to set it in the dom
			const physicalProps = this.physicalProps();
			if (physicalProps[prop]) {
				// set the prop on the node
				if (value === false) {
					this.removeAttribute(prop);
				} else if (typeof(value) === 'object') {
					this.setAttribute(prop, JSON.stringify(value));
				} else if (typeof(value) === 'function') {
					this.setAttribute(prop, 'fn');
				} else {
					this.setAttribute(prop, value);
				}
			}
		});
	}

	/**
	 * Compute props by mixing settings with attributes presents on the component
	 */
	_computeProps() {
		for (let i=0; i<this.attributes.length; i++) {
			const attr = this.attributes[i];
			if ( ! attr.value) {
				// the attribute has no value but it is present
				// so we assume the prop value is true
				this.props[__camelize(attr.name)] = true
				continue;
			}
			// cast the value
			this.props[__camelize(attr.name)] = __autoCast(attr.value);
		}

		// handle physicalProps
		for (let key in this.props) {
			const value = this.props[key];
			// handle physical props
			this._handlePhysicalProps(key, value);
		}
	}

	/**
	 * componentClassName
	 * Set a class that will be construct with the componentNameDash,
	 * an optional element and modifier
	 * @param 	{String} 	[element=null] 		The element name
	 * @param 	{String} 	[modifier=null] 	The modifier name
	 * @param 	{String} 	[state=null] 		The state name
	 * @return 	{String} 						The generated class
	 */
	componentClassName(element = null, modifier = null, state = null) {
		// if the method is BEM
		let sel = this.tagName.toLowerCase();
		if (sSettings && sSettings.selector.method.toLowerCase() === 'smaccs') {
			if (element) {
				sel += `-${element}`;
			}
			if (modifier) {
				sel += `-${modifier}`;
			}
			if (state) {
				sel += ` is-${state}`;
			}
		} else {
			if (element) {
				sel += `__${element}`;
			}
			if (modifier) {
				sel += `--${modifier}`;
			}
			if (state) {
				sel += `--${state}`;
			}
		}
		return sel;
	}

	/**
	 * Get a component selector class built with the passed element, modifier and state parameters
	 * @param 	{String} 	[element=null] 		The element name
	 * @param 	{String} 	[modifier=null] 	The modifier name
	 * @param 	{String} 	[state=null] 		The state name
	 * @return 	{String} 						The generated class
	 */
	componentSelector(element = null, modifier = null, state = null) {
		let sel = this.componentClassName(element, modifier, state);
		sel = `.${sel}`.replace(' ','.');
		return sel;
	}

	/**
	 * hasComponentClass
	 * Check if the passed element has the component class generated by the element and modifier argument
	 * @param 	{HTMLElement} 	elm 				The element to check
	 * @param 	{String} 		[element=null] 		The element name
	 * @param 	{String} 		[modifier=null] 	The modifier name
	 * @param 	{String} 		[state=null] 		The state name
	 * @return 	{Boolean} 							The check result
	 */
	hasComponentClass(elm, element = null, modifier = null, state = null) {
		// generate the class
		const cls = this.componentSelector(element, modifier, state);
		const _cls = cls.split('.');
		for (let i=0; i<_cls.length; i++) {
			const cl = _cls[i];
			if (cl && cl !== '') {
				if ( ! elm.classList.contains(cl)) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Add a class on the passed element that will be construct with the componentNameDash,
	 * an optional element, modifier and state
	 * @param 	{String} 	[element=null] 		The element name
	 * @param 	{String} 	[modifier=null] 	The modifier name
	 * @param 	{String} 	[state=null] 		The state name
	 * @return 	{SComponent}} 			The component itself
	 */
	addComponentClass(elm, element = null, modifier = null, state = null) {
		// if is an array
		if (elm instanceof Array
			|| elm instanceof NodeList) {
			[].forEach.call(elm, (el) => {
				this.addComponentClass(el, element, modifier, state);
			});
			return this;
		}

		// get the component class
		let cls = this.componentSelector(element, modifier, state);
		// loop on each classes to add
		cls.split('.').forEach((cl) => {
			if (cl && cl !== '') {
				fastdom.mutate(() => {
					elm.classList.add(cl);
				});
			}
		});
		// return the instance to maintain chainability
		return this;
	}

	/**
	 * Remove a class on the passed element that will be construct with the componentNameDash,
	 * an optional element, modifier and state
	 * @param 	{String} 	[element=null] 		The element name
	 * @param 	{String} 	[modifier=null] 	The modifier name
	 * @param 	{String} 	[state=null] 		The state name
	 * @return 	{SComponent}} 					The component itself
	 */
	removeComponentClass(elm, element = null, modifier = null, state = null) {
		// if is an array
		if (elm instanceof Array
			|| elm instanceof NodeList) {
			[].forEach.call(elm, (el) => {
				this.removeComponentClass(el, element, modifier, state);
			});
			return this;
		}

		// get the component class
		let cls = this.componentSelector(element, modifier, state);
		// loop on each classes to add
		cls.split('.').forEach((cl) => {
			if (cl && cl !== '') {
				fastdom.mutate(() => {
					elm.classList.remove(cl);
				});
			}
		});
		// return the instance to maintain chainability
		return this;
	}
}
