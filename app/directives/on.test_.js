/* global global, document, setTimeout */

import assert from 'assert'
import { TriskelApp } from '../app'
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

  var _APP = new TriskelApp()

  it('data-on:click', function (done) {
    var el

    _APP.render(document.body, [{
      tag: 'div',
      attrs: {
        'data-on:click': '_runClick(this)',
      },
    }], {
      withNode: {
        initNode: function (_el) {
          el = _el
          setTimeout(function () {
            el.click()
          })
        },
      },
      data: {
        _runClick: function (_el) {
          assert.strictEqual(_el, el)
          done()
        },
      },
    })

  })

  it('data-on:click.then', function (done) {
    var el, clicked

    _APP.render(document.body, [{
      tag: 'div',
      attrs: {
        'data-on:click': '_runClick(this)',
      },
    }], {
      withNode: {
        initNode: function (_el) {
          el = _el
          setTimeout(function () {
            el.click()
          })
        },
      },
      data: {
        _runClick: function (_el) {
          if( !clicked ) {
            clicked = true
            return {
              then: function () {
                setTimeout(function () {
                  el.click()
                })
              },
            }
          }
          assert.strictEqual(_el, el)
          done()
        },
      },
    })

  })

})

/** */
})
/** */
