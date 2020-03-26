
/* global global, document */

import assert from 'assert'
import { TriskelApp } from '../app'
import { JSDOM } from 'jsdom'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('directive [data-bind]', function () {

  beforeEach(function () {
    const { window } = new JSDOM()

    global.window = window
    global.document = window.document
    global.MutationObserver = window.MutationObserver
  })

  var _APP = new TriskelApp()
  _APP.defineFilter('bar', function (text) {
    return text + 'bar'
  })

  it('[data-bind] error', function () {

    assert.throws( function () {

      _APP.render(document.body, [{
        tag: 'div',
        attrs: {
          'data-bind': ' foo ',
        },
      }])

    }, TypeError )

  })

  it('[data-bind] foo ', function () {

    _APP.render(document.body, [{
      tag: 'div',
      attrs: {
        'data-bind': ' foo ',
      },
    }], {
      data: {
        foo: 'foobar',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<div data-bind=" foo ">foobar</div>')

  })

  it('[data-bind] foo | bar', function () {

    _APP.render(document.body, [{
      tag: 'div',
      attrs: {
        'data-bind': ' foo | bar ',
      },
    }], {
      data: {
        foo: 'foo',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<div data-bind=" foo | bar ">foobar</div>')

  })

  it('[data-bind] foo | bar', function () {

    _APP.render(document.body, [{
      tag: 'div',
      attrs: {
        'data-bind': ' foo ',
      },
    }], {
      data: {
        foo: [{
          tag: 'foo',
          content: '{{ bar }}',
        }],
        bar: 'foobar',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<div data-bind=" foo "><foo><!-- text: {{ bar }} -->foobar</foo></div>')

  })

})

/** */
})
/** */
