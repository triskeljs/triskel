/* global global, document */

import assert from 'assert'
import { createApp } from '../app'
import { JSDOM } from 'jsdom'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('directive (custom)', function () {

  beforeEach(function () {
    const { window } = new JSDOM()

    global.window = window
    global.document = window.document
    global.MutationObserver = window.MutationObserver
  })

  var _APP = createApp()

  it('directive matched', function () {

    var directive_rendered = false

    _APP.directive('foo-bar', function () {
      directive_rendered = true
    })

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'foo-bar': ' foo ',
      },
    }])

    assert.strictEqual( directive_rendered, true )

  })

  it('directive RegExp', function () {

    var directive_rendered = false

    _APP.directive(/foo-bar/, function () {
      directive_rendered = true
    })

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'foo-bar': ' foo ',
      },
    }])

    assert.strictEqual( directive_rendered, true )

  })

  it('directive replace_by_comment', function () {

    var directive_rendered = false

    _APP.directive(/foo-bar/, function () {
      directive_rendered = true
    }, {
      replace_by_comment: ' foobar ',
    })

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'foo-bar': ' foo ',
      },
    }])

    assert.strictEqual( directive_rendered, true )
    assert.strictEqual( document.body.innerHTML, '<!-- foobar -->' )

  })

})

/** */
})
/** */
