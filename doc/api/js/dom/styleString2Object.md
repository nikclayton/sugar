


-----------------------------
## API
-----------------------------

### styleString2Object(String style) : (Object)
Transform a style string to an object representation

- Privacy : **Public**

- Return : **(Object)** : The string object representation

Name | Type | Description | Status | Default
------------ | ------------ | ------------ | ------------ | ------------
style | **String** | The style string | required | 


#### Sample
```js
import styleString2Object from 'sugarcss/js/dom/styleString2Object'
const styleString = styleString2Object('padding-left:20px; display:block;');
// output => {
//		paddingLeft : '20px',
// 		display : 'block'
// }

```

