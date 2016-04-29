// imports
import sDom from './s-dom';
var _extend = require('lodash/extend');

// prepare a settings object to store
// the getted settings from the css
let settings = {};

// wait the css to be loaded
sDom.domReady(() => {
	let settingsElm = document.createElement('div');
	settingsElm.classList.add('s-settings');
	document.body.appendChild(settingsElm);
	let _settings = window.getComputedStyle(
		document.querySelector('.s-settings'), ':after'
	).getPropertyValue('content');
	if (_settings) {
		_settings = _settings.replace(/\\\'\\"/g,'"').replace(/\\"\\\'/g,'"');
		_settings = _settings.replace(/\'\\"/g,'"').replace(/\\"\'/g,'"');
		_settings = _settings.replace(/'"/g,'"').replace(/"'/g,'"');
		_settings = _settings.slice(1,_settings.length - 1);
		_settings = JSON.parse(_settings);
		settings = _extend(settings, _settings);
	}
});

// export the settings
module.exports = settings;