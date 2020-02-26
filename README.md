# @triskel

[![ᴋɪʟᴛ ᴊs](https://kiltjs.github.io/assets/images/badge-kiltjs.svg)](https://github.com/kiltjs)
[![Build Status](https://travis-ci.org/kiltjs/triskel.svg?branch=master)](https://travis-ci.org/kiltjs/triskel)
[![Build Status](https://cloud.drone.io/api/badges/kiltjs/triskel/status.svg)](https://cloud.drone.io/kiltjs/triskel)
[![codecov](https://codecov.io/gh/kiltjs/triskel/branch/master/graph/badge.svg)](https://codecov.io/gh/kiltjs/triskel)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

### Installation

``` sh
npm install -D @triskel/app

# includes:

# @triskel/loader
# @triskel/render
#   - @triskel/con-text
```

#### packages included

- @triskel/con-text

Provides tools for eval and interpolate text and also pipe evaluated expressions across shared filters


`@triskel/parser`
  Parses HTML into @triskelAST

| HTML | @triskelAST |
| -- | -- |
| `<h1>Title 1</h1>` | <code>{<br>&nbsp;$: 'h1',<br>&nbsp;_: 'Title 1',<br>} </code> |


> @triskel/loader
  Parses and load HTML as stringified @triskelAST for webpack and rollup (`@triskel/loader/rollup`)

`dependencies: @triskel/parser`


> @triskel/render
  Renders @triskelAST into the DOM

`dependencies: @triskel/con-text`


> @triskel/stringify
  Serializes @triskelAST into a String


> @triskel/tinyhtml
  Parses into @triskelAST and serializes back minifying the resulting HTML

`dependencies: @triskel/parser, @triskel/stringify`

> @triskel/template
  This is a regular template engine to interpolate and render Strings
  
`dependencies: @triskel/con-text`


