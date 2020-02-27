
import { RenderApp } from './empty-app'
import { ConText } from '@triskel/con-text'

import addDirectiveIf from './directives/if'
import addDirectiveRepeat from './directives/repeat'
import addDirectiveOn from './directives/on'
import addDirectiveBind from './directives/bind'
import addDirectiveClass from './directives/class'

export function createApp(options) {
  options = options || {}

  var add_directives = {
        if: true,
        repeat: true,
        bind: true,
        on: true,
        'class': true,
        ...(options.add_directives || {}),
      },
      directive_ns = options.directive_ns || 'data',
      render_options = {}

  var app = new RenderApp(render_options)

  // Data envelope for RenderApp

  var APP = Object.create( app ),
      TEXT = ConText(APP)

  // APP.directive = function (directive, initNode, with_node) {
  //
  //   app.directive(directive, function () {
  //     // this.watchData = watchData;
  //     initNode.apply(this, arguments);
  //   }, with_node);
  //
  // };

  // preset directives

  var special_chars = {
    nbsp: '\u00a0', hellip: '…', quot: '"',
  }

  APP.withNode(function (node) {
    var text_node = typeof node === 'string' ? node : node.text

    if( text_node ) return {
      replace_text: '',
      initNode: function (el) {
        var renderText = TEXT.interpolate(text_node),
            parent_el = el.parentElement || el.parentNode

        if( parent_el && /{{.*}}/.test(text_node) ) parent_el.insertBefore( document.createComment(' text: ' + text_node + ' '), el )

        this.watchData(function (data) {
          var text = renderText(data).replace(/&([a-z]+);/g, function (matched, special_char) {
            return special_chars[special_char] || matched
          })
          if( text !== el.textContent ) el.textContent = text
        })
      },
    }
  })

  if( add_directives.if ) addDirectiveIf(APP, TEXT, directive_ns)
  if( add_directives.repeat ) addDirectiveRepeat(APP, TEXT, directive_ns)
  if( add_directives.bind ) addDirectiveBind(APP, TEXT, directive_ns)
  if( add_directives.on ) addDirectiveOn(APP, TEXT, directive_ns)
  if( add_directives['class'] ) addDirectiveClass(APP, TEXT, directive_ns)

  function _renderApp (_parent, _nodes, render_options) {

    render_options = Object.create(render_options || {})

    var APP_ = Object.create(this),
        // parent_app = render_options.parent_app || {},
        data = render_options.data || {},
        data_listeners = [],
        watchData = function (onData) {
          data_listeners.push(onData)
          onData(data)
        },
        updateData = function (_data) {
          if( _data ) data = _data
          data_listeners.forEach(function (listener) {
            listener(data)
          })
        }

    APP_.render_app = APP_.render_app || APP_
    APP_.watchData = watchData
    APP_.updateData = updateData
    APP_.render = _renderApp.bind(APP_)

    Object.defineProperty(APP_, 'data', {
      get: function () {
        return data
      },
    })

    var inserted_nodes = app.render.apply(APP_, arguments)

    return {
      get data () {
        return data
      },
      set data (_data) {
        updateData(_data)
      },
      updateData: updateData,
      inserted_nodes: inserted_nodes,
    }

  }

  APP.render = _renderApp.bind(APP)

  return APP
}

var APP = createApp()

export default APP
