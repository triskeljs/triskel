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

| package | dependencies | description |
| -- | -- | -- |
| `@triskel/con-text` | - | Provides tools for eval and interpolate text and also pipe evaluated expressions across shared filters |
| `@triskel/parser` | - | Parses HTML into [@triskelAST](#@triskelAST) |
| `@triskel/loader` | `@triskel/parser` | Parses and load HTML as stringified @triskelAST for webpack and rollup (`@triskel/loader/rollup`) |
| `@triskel/render` | `@triskel/con-text` | Renders @triskelAST into the DOM |
| `@triskel/stringify` | - | Serializes @triskelAST into a String |
| `@triskel/tinyhtml` | `@triskel/parser, @triskel/stringify` | Parses into @triskelAST and serializes back minifying the resulting HTML |

| package | dependencies | description |
| -- | -- | -- |
| @triskel/template | `@triskel/con-text` | This is a regular template engine to interpolate and render Strings |


#### @triskelAST

| HTML | @triskelAST |
| -- | -- |
| `<h1>Title 1</h1>` | <code>{<br>&nbsp;$: 'h1',<br>&nbsp;_: 'Title 1',<br>} </code> |
