# @triskel/con-text

[![npm](https://img.shields.io/npm/v/@triskel/con-text.svg?maxAge=1200)](https://www.npmjs.com/package/@triskel/con-text)
[![Build Status](https://travis-ci.org/triskeljs/con-text.svg?branch=master)](https://travis-ci.org/triskeljs/con-text)
[![Build Status](https://cloud.drone.io/api/badges/triskeljs/con-text/status.svg)](https://cloud.drone.io/triskeljs/app)
[![dependencies Status](https://david-dm.org/triskeljs/con-text/status.svg)](https://david-dm.org/triskeljs/con-text)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

``` sh
npm install -D @triskel/con-text
```

## Examples

``` js
import createConText from '@triskel/con-text';

var TEXT = createConText();
```

### Evaluating expressions

``` js

TEXT.eval(' foo ? foo : 'bar' ', { foo: 'foobar' });
// results: 'foobar'

TEXT.eval(' foo ? foo : 'bar' ', { foo: false });
// results: 'bar'

```

### Using Filters

``` js

TEXT.defineFilter('amount', function (amount) {
  return parseInt(amount/100) + ',' + amount%100;
});

TEXT.eval(' price | amount ', { price: 12345 });
// results: '123,45'

/* ----------------------- */

TEXT.defineFilter('title', function (input_text) {
  return 'title: ' + input_text;
});

TEXT.eval(' foo | title ', { foo: 'bar' });
// results: 'title: bar'

TEXT.eval(' foo | title ', { foo: 'foobar' });
// results: 'title: foobar'

```

### Interpolating text

``` js
TEXT.defineFilter('amount', function (amount) {
  return parseInt(amount/100) + ',' + amount%100;
});

TEXT.interpolate('current price: {{ price | amount }}€', { price: 12345 });
// results: 'current price: 123,45€'

```
