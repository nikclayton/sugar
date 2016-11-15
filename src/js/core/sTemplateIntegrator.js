import __autoCast from '../utils/string/autoCast'

class STemplateIntegrator {

	/**
	 * Store all the component integration functions registered
	 * @private
	 * @type 	{Object}
	 */
	_componentsIntegrationFnStack = {};

	keepAttribute() { return this; }
	exclude() { return this; }

	/**
	 * Register a component integration function
	 * @param 	{Function} 		integrationFn 		The function used to set the integration attributes, etc into the component elements
	 */
	registerComponentIntegration(componentClassName, fn) {
		if (componentClassName instanceof Array) {
			componentClassName.forEach((className) => {
				if ( ! this._componentsIntegrationFnStack[className]) {
					this._componentsIntegrationFnStack[className] = [];
				}
				if (this._componentsIntegrationFnStack[className].indexOf(fn) === -1) {
					this._componentsIntegrationFnStack[className].push(fn);
				}
			});
		} else {
			if ( ! this._componentsIntegrationFnStack[componentClassName]) {
				this._componentsIntegrationFnStack[componentClassName] = [];
			}
			if (this._componentsIntegrationFnStack[componentClassName].indexOf(fn) === -1) {
				this._componentsIntegrationFnStack[componentClassName].push(fn);
			}
		}
	}

	getIntegrationFrom(elm) {
		let integration = elm._sTemplateIntegration || {
			ignore : {
				"s-template-integration" : true,
				"s-template-refresh" : true
			},
			refresh : false
		};
		return integration;
	}

	setIntegrationTo(elm, integration) {
		elm._sTemplateIntegration = integration;
		// elm.setAttribute('s-template-integration', JSON.stringify(integration));
		return this;
	}

	ignore(elm, what = null) {

		if ( ! elm) return this;

		// get integration settings
		let integration = this.getIntegrationFrom(elm);

		// autocast what
		if (what) what = __autoCast(what);

		// we ignore the tag itself
		if (integration.ignore === true) {
			return this;
		}

		// if has no what parameter
		// mean that we want to ignore the tag itself
		if (! what || what === true) {
			integration.ignore = true;
			return this.setIntegrationTo(elm, integration);
		}
		// if we don't have any ignore for now
		// set the new object
		if (what && typeof(what) === 'object') {
			if (integration.ignore && typeof(integration.ignore) === 'object') {
				what = Object.assign(integration.ignore, what);
			}
			return this.setIntegrationTo(elm, integration);
		}
		// return the this class
		return this;
	}

	/**
	 * Set an element to refresh completely when the this handle it
	 * @param 	{HTMLElement} 	elm 	The element to refresh
	 */
	refresh(elm) {
		if ( ! elm) return this;
		elm.setAttribute('s-template-refresh', true);
		return this;
	}

}

export default new STemplateIntegrator();
