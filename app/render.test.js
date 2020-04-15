/* global global, document */

import assert from 'assert'
import renderNodes from './render'
import { JSDOM } from 'jsdom'

import { runErrorsTestSuite } from '../_common/test.helpers'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('rendering HTML', function () {

  beforeEach(function () {
    const { window } = new JSDOM()

    global.window = window
    global.document = window.document
    global.MutationObserver = window.MutationObserver
  })

  it('render error', function () {

    assert.throws(function () {
      renderNodes(document.body, [{}])
    }, TypeError)

  })

  it('empty render', function () {

    renderNodes(document.body, [])

    assert.strictEqual( document.body.innerHTML, '' )

  })

  it('render Function attr', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar', foo: function () {
      return 'bar'
    } }, content: 'foobar' }]

    renderNodes(document.body, html_nodes)

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar" foo="bar">foobar</div>' )

  })

  it('render Function attr: null', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar', foo: function () {
      return null
    } }, content: 'foobar' }]

    renderNodes(document.body, html_nodes)

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' )

  })

  it('render div', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar' }, content: 'foobar' }]

    renderNodes(document.body, html_nodes)

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' )

    renderNodes(document.body, html_nodes)

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' )

  })

  it('render several p', function () {

    var html_nodes = [
      { tag: 'p', content: 'Lorem ipsum...' },
      { tag: 'p', content: 'dolor sit...' },
      { tag: 'p', content: 'amet...' },
    ]

    renderNodes(document.body, html_nodes)

    assert.strictEqual( document.body.innerHTML, '<p>Lorem ipsum...</p><p>dolor sit...</p><p>amet...</p>' )

  })

  it('render svg', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar' }, content: [
      { tag:'svg', attrs: { height: '100', width: '100' }, content: [
        { tag: 'circle', attrs: { cx: '50', cy: '50', r: '40', stroke: 'black', 'stroke-width': '3', fill: 'red' } },
      ] },
    ] }]

    renderNodes(document.body, html_nodes)

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar"><svg height="100" width="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></svg></div>' )

  })

  it('render function attributes', function () {

    renderNodes(document.body, [{ tag:'div', attrs: { 'class': function () { return 'foo-bar' } }, content: 'foobar' }])

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' )

    renderNodes(document.body, [{ tag:'div', attrs: { 'class': () => 'foo-bar' }, content: 'foobar' }])

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' )

  })

  it('rendering text nodes', function () {

    renderNodes(document.body, [{ tag:'div', attrs: { 'class': function () { return 'foo-bar' } }, content: [{ text: 'foobar' }] }])

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' )

  })

  it('rendering mixed text nodes', function () {

    renderNodes(document.body, ['foobar', { tag:'div', attrs: { 'class': function () { return 'foo-bar' } }, content: [{ text: 'foobar' }] }])

    assert.strictEqual( document.body.innerHTML, 'foobar<div class="foo-bar">foobar</div>' )

  })

  it('rendering comments', function () {

    renderNodes(document.body, ['foobar ', { comments: ' foobar ' }])

    assert.strictEqual( document.body.innerHTML, 'foobar <!-- foobar -->' )

  })

  it('rendering removing comments', function () {

    renderNodes(document.body, ['foobar ', { comments: ' foobar ' }], { remove_comments: true })

    assert.strictEqual( document.body.innerHTML, 'foobar ' )

  })

  runErrorsTestSuite([
    [() => renderNodes(document.body, [{}]), Error, TypeError, /unknown node format/],
    [() => renderNodes(document.body, [{tag: 'div'}], { withNode() { return { initNode: 123 } } }), Error, TypeError, /initNode should be a Function/],
  ])

  it('withNode', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar' }, content: 'foobar' }, { tag:'div', attrs: { 'data-if': ' foo === bar ' }, content: 'foobar' }]

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( node.attrs && 'data-if' in node.attrs ) return {
          replace_by_comment: ' data-if replaced by comment ',
        }
      },
    })

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div><!-- data-if replaced by comment -->' )

  })

  it('withNode (text)', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar' }, content: 'foobar' }, { tag:'div', attrs: { 'data-if': ' foo === bar ' }, content: 'foobar' }]

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( 'text' in node ) return {
          replace_by_comment: ' ' + node.text + ' ',
        }
      },
    })

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar"><!-- foobar --></div><div data-if=" foo === bar "><!-- foobar --></div>' )

  })

  it('withNode (text -clear-)', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar' }, content: 'foobar' }, { tag:'div', attrs: { 'data-if': ' foo === bar ' }, content: 'foobar' }]

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( 'text' in node ) return {
          replace_text: '',
        }
      },
    })

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar"></div><div data-if=" foo === bar "></div>' )

  })

  it('withNode (text -clear-)', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar' }, content: 'foobar' }, 'foobar', { tag:'div', attrs: { 'data-if': ' foo === bar ' }, content: 'foobar' }]

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( 'text' in node ) return {
          replace_text: '',
        }
      },
    })

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar"></div><div data-if=" foo === bar "></div>' )

  })

  it('initNode', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar' }, content: 'foobar' }, { tag:'div', attrs: { 'data-if': ' foo === bar ' }, content: 'foobar' }],
        matched_node

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( node.attrs && 'data-if' in node.attrs ) return {
          initNode (node_el) {
            matched_node = node_el
          },
        }
      },
    })

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div><div data-if=" foo === bar ">foobar</div>' )
    assert.strictEqual( matched_node.nodeName, 'DIV' )
    assert.strictEqual( matched_node.getAttribute('data-if'), ' foo === bar ' )

  })

  it('onCreate', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar' }, content: 'foobar' }],
        is_created = false,
        is_rendered = false

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( 'text' in node ) return {
          onCreate: function () {
            assert.strictEqual(is_created, false, 'onCreate: is_created')
            assert.strictEqual(is_rendered, false, 'onCreate: is_rendered')
            is_created = true
          },
          initNode: function () {
            assert.strictEqual(is_created, true, 'initNode: is_created')
            assert.strictEqual(is_rendered, false, 'initNode: is_rendered')
            is_rendered = true
          },
        }
      },
    })

  })

  it('insert_before', function () {

    var html_nodes = [{ tag:'div', attrs: { 'class': 'foo-bar' }, content: 'foobar' }, { tag:'div', attrs: { 'insert-before': ' me ' }, content: 'foobar' }],
        append_nodes = [{ tag:'foo-bar' }, { tag:'bar-foo', attrs: { 'foo': 'bar' }, content: ' text content ' }],
        insert_before

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( node.attrs && node.attrs['insert-before'] === ' me ' ) return {
          initNode: function (node_el) {
            insert_before = node_el
          },
        }
      },
    })

    renderNodes(document.body, append_nodes, {
      insert_before: insert_before,
    })

    assert.strictEqual( insert_before.nodeName, 'DIV' )
    assert.strictEqual( insert_before.getAttribute('insert-before'), ' me ' )
    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div><foo-bar></foo-bar><bar-foo foo="bar"> text content </bar-foo><div insert-before=" me ">foobar</div>' )

  })

})

/** */
})
/** */
