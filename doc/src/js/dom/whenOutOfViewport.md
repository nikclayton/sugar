# whenOutOfViewport

Monitor an HTMLElement to be notified when it exit the viewport



Name  |  Type  |  Description  |  Status  |  Default
------------  |  ------------  |  ------------  |  ------------  |  ------------
elm  |  **{ [HTMLElement](https://developer.mozilla.org/fr/docs/Web/API/HTMLElement) }**  |  The element to monitor  |  required  |
cb  |  **{ [Function](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Function) }**  |  An optional callback to call when the element exit the viewport  |  optional  |  null

Return **{ (Promise) }** The promise that will be resolved when the element exit the viewport

### Example
```js
	import whenOutOfViewport from 'sugarcss/js/dom/whenOutOfViewport'
whenOutOfViewport(myCoolHTMLElement).then((elm) => {
		// do something with your element that has exit the viewport...
});
```
Author : Olivier Bossel <olivier.bossel@gmail.com>

Default : **null) {**