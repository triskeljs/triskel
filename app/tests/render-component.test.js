/* global global, document */

import assert from 'assert'
import { createApp } from '../app'
import { JSDOM } from 'jsdom'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('APP.component', function () {

  beforeEach(function () {
    const { window } = new JSDOM()

    global.window = window
    global.document = window.document
    global.MutationObserver = window.MutationObserver
  })

  it('render error', function () {

    var _APP = createApp()

    assert.throws(function () {
      _APP.component('my-div')
    }, TypeError)

    assert.throws(function () {
      _APP.component('my-div', 123)
    }, TypeError)

    assert.throws(function () {
      _APP.component('my-div', null)
    }, TypeError)

    _APP.component('my-div', {
      template: 'String not allowed',
    })

    assert.throws(function () {
      _APP.render(null, [{
        tag: 'my-div',
      }])
    }, TypeError)

  })

  it('basic render', function () {

    var _APP = createApp()

    _APP.component('my-div', function (el) {
      assert.strictEqual(el.nodeName, 'MY-DIV')
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div></my-div>')

    _APP.render(document.body, [{
      tag: 'my-div', content: 'Hi {{ first_name }}!',
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ first_name }}! -->Hi John!</my-div>')

  })

  it('replace_by_comment', function () {

    var _APP = createApp()

    _APP.component('my-div', {
      controller: function (el) {
        assert.strictEqual(el.nodeName, '#comment')
      },
      withNode: function () {
        return {
          replace_by_comment: ' comented my-div ',
        }
      },
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }])

    assert.strictEqual(document.body.innerHTML, '<!-- comented my-div -->')

  })

  it('template replace_by_comment', function () {

    var _APP = createApp()

    _APP.component('my-div', {
      template: ['foobar'],
      controller: function (el) {
        assert.strictEqual(el.nodeName, 'MY-DIV')
      },
    }, {
      withNode: function () {
        return {
          replace_by_comment: ' comented text ',
        }
      },
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }])

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- comented text --></my-div>')

  })

  it('withNode called', function () {

    var _APP = createApp(),
        with_node_called = false

    _APP.component('my-div', {
      controller: function (el) {
        assert.strictEqual(el.nodeName, 'MY-DIV')
      },
      withNode: function () {
        with_node_called = true
      },
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }])

    assert.strictEqual(with_node_called, true)

  })

  it('initNode called', function () {

    var _APP = createApp(),
        with_node_called = false,
        init_node_called = false

    _APP.component('my-div', {
      controller: function (el) {
        assert.strictEqual(el.nodeName, 'MY-DIV')
      },
      withNode: function () {
        with_node_called = true
        return {
          initNode: function () {
            init_node_called = true
          },
        }
      },
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }])

    assert.strictEqual(with_node_called, true)
    assert.strictEqual(init_node_called, true)

  })

  it('initNode called (with template)', function () {

    var _APP = createApp(),
        with_node_called = false,
        init_node_called = false

    _APP.component('my-div', {
      template: ['foobar'],
      controller: function (el) {
        assert.strictEqual(el.nodeName, 'MY-DIV')
      },
      withNode: function () {
        with_node_called = true
        return {
          initNode: function () {
            init_node_called = true
          },
        }
      },
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }])

    assert.strictEqual(with_node_called, true)
    assert.strictEqual(init_node_called, true)

  })

  it('render and detach', function (done) {

    var _APP = createApp()

    _APP.component('my-div', function (el) {
      assert.strictEqual(el.nodeName, 'MY-DIV')

      this.onDetach(function () {
        assert.strictEqual(this, el, 'detach this')
        done()
      })
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }, {
      tag: 'div',
      content: [{ tag: 'div' }],
    }])

    _APP.render(document.body.querySelector('div'), [])

    _APP.render(document.body, [])

  })

  it('rendering template', function () {

    var _APP = createApp()

    _APP.component('my-div', {
      template: ['Hi {{ first_name }}!'],
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ first_name }}! -->Hi John!</my-div>')

  })

  it('rendering template component.data', function () {

    var _APP = createApp()

    _APP.component('my-div', {
      template: ['Hi {{ first_name }}!'],
      data: {
        first_name: 'John',
      },
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }])

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ first_name }}! -->Hi John!</my-div>')

  })

  it('rendering template component template_options.data', function () {

    var _APP = createApp()

    _APP.component('my-div', {
      template: ['Hi {{ first_name }}!'],
    }, {
      data: {
        first_name: 'John',
      },
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }])

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ first_name }}! -->Hi John!</my-div>')

  })

  it('rendering template overrides', function () {

    var _APP = createApp()

    _APP.component('my-div', {
      template: ['Hi {{ last_name }}!'],
    })

    _APP.render(document.body, [{
      tag: 'my-div', content: 'Hi {{ first_name }}!',
    }], {
      data: {
        first_name: 'John',
        last_name: 'Smith',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ last_name }}! -->Hi Smith!</my-div>')

  })

  it('rendering template with controller', function () {

    var _APP = createApp()

    _APP.component('my-div', {
      template: ['Hi {{ first_name }}!'],
      controller: function (el) {
        assert.strictEqual(el.nodeName, 'MY-DIV')
      },
    })

    _APP.render(document.body, [{
      tag: 'my-div',
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ first_name }}! -->Hi John!</my-div>')

  })

  it('rendering template overrides with controller', function () {

    var _APP = createApp()

    _APP.component('my-div', {
      template: ['Hi {{ last_name }}!'],
      controller: function (el) {
        assert.strictEqual(el.nodeName, 'MY-DIV')
      },
    })

    _APP.render(document.body, [{
      tag: 'my-div', content: 'Hi {{ first_name }}!',
    }], {
      data: {
        first_name: 'John',
        last_name: 'Smith',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ last_name }}! -->Hi Smith!</my-div>')

  })

})

/** */
})
/** */
