
/*
 * Sugar-webfonts.js
 *
 * This little js file allow you to use webfonts based64 encoded and loaded from localstorage
 *
 * @author   Olivier Bossel <olivier.bossel@gmail.com>
 * @created  23.11.15
 * @updated  23.11.15
 * @version  1.0.0
 */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    factory();
  } else {
    factory();
  }
})(function() {
  window.SugarDOMNodeInserted = {
    _inited: false,
    enabled: true,

    /*
    		Init
     */
    init: function() {
      this._inited = true;
      if (document.readyState === 'interactive') {
        return this._init();
      } else {
        return document.addEventListener('DOMContentLoaded', (function(_this) {
          return function(e) {
            return _this._init();
          };
        })(this));
      }
    },

    /*
    		Internal init
     */
    _init: function() {
      if (!this.enabled) {
        return;
      }
      document.addEventListener("animationstart", this._onAnimationStart, false);
      document.addEventListener("MSAnimationStart", this._onAnimationStart, false);
      return document.addEventListener("webkitAnimationStart", this._onAnimationStart, false);
    },

    /*
    		On animation start
     */
    _onAnimationStart: function(e) {
      if (e.animationName === 's-DOMNodeInserted') {
        return e.target.dispatchEvent(new CustomEvent('DOMNodeInserted', {
          bubbles: true,
          cancelable: true
        }));
      }
    }
  };
  SugarDOMNodeInserted.init();
  return SugarDOMNodeInserted;
});

//# sourceMappingURL=sugar-DOMNodeInserted.js.map
