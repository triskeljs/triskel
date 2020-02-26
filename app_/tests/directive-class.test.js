/* global global, document */

import assert from 'assert'
import { createApp } from '../app'
import { JSDOM } from 'jsdom'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('directive [data-if]', function () {

  beforeEach(function () {
    const { window } = new JSDOM()

    global.window = window
    global.document = window.document
    global.MutationObserver = window.MutationObserver
  })

  var _APP = createApp()

  it('errors', function () {

    assert.throws(function () {
      _APP.render(document.body, [{
        $: 'div',
        attrs: {
          'data-class': `[123]`,
        },
      }])
    }, TypeError)

  })

  it('class null', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': 'null',
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="null"></div>')

  })

  it('class [null]', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': '[null]',
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="[null]"></div>')

  })

  it('class _foo-bar', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': "{ _foo: '-bar' }",
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="{ _foo: \'-bar\' }" class="_foo _foo-bar"></div>')

  })

  it('class _foo-bar _bar-foo', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': '{ _foo: "-bar", _bar: "-foo" }',
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="{ _foo: \'-bar\', _bar: \'-foo\' }" class="_foo _foo-bar _bar _bar-foo"></div>')

  })

  it('class _foo _bar', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': `['_foo', '_bar']`,
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="[\'_foo\', \'_bar\']" class="_foo _bar"></div>')

  })

  it('class _foo [_bar]', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': `['_foo', ['_bar']]`,
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="[\'_foo\', [\'_bar\']]" class="_foo _bar"></div>')

  })

  it('class _foo _foo-bar _bar', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': `[{ _foo: '-bar' }, '_bar']`,
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="[{ _foo: \'-bar\' }, \'_bar\']" class="_foo _foo-bar _bar"></div>')

  })

})

/** */
})
/** */
