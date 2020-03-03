
# @triskel/con-text

[Documentation](https://kiltjs.github.io/triskel/module-con-text.html)

[![ᴋɪʟᴛ ᴊs](https://kiltjs.github.io/assets/images/badge-kiltjs.svg)](https://github.com/kiltjs)
[![dependencies free](https://kiltjs.github.io/assets/images/badge-dependencies-free.svg)](https://www.npmjs.com/package/@kilt/triskel)
[![GitHub license](https://kiltjs.github.io/assets/images/badge-license-mit.svg)](LICENSE)

### Installation

``` sh
npm install -D @triskel/con-text
```

``` js
import { ConText } from '@triskel/con-text'
import layout_html from './layout.html'

TEXT = new ConText()

TEXT.defineFilter( 'uppercase', (text) => text.toUpperCase() )

const getUpperCaseFirstName = TEXT.eval(' person.first_name | uppercase ')

getUpperCaseFirstName({ person: { first_name: 'John', last_name: 'Smith' } })
// returns: 'JOHN'

const getWelcomeParagraph = TEXT.interpolate('Hello {{ person.first_name }} {{ person.last_name | uppercase }},')

getWelcomeParagraph({ person: { first_name: 'John', last_name: 'Smith' } })
// returns: 'Hello John SMITH,'

```
