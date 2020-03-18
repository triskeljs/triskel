
import { RenderApp } from './empty-app'
import { ConText } from '@triskel/con-text'

import addDirectiveIf from './directives/if'
import addDirectiveRepeat from './directives/repeat'
import addDirectiveOn from './directives/on'
import addDirectiveBind from './directives/bind'
import addDirectiveClass from './directives/class'

var special_chars = {
  nbsp: '\u00a0', hellip: '…', quot: '"', amp: '&',
}

function _replaceSpecialChars (matched, special_char) {
  return special_char in special_chars
    ? special_chars[special_char]
    : matched
}

export function TriskelApp (options = {}) {
  RenderApp.call(this, options)
  this.super = Object.getPrototypeOf(this)

  const APP = this
  ConText(this)

  var add_directives = {
    if: true,
    repeat: true,
    bind: true,
    on: true,
    'class': true,
    ...(options.add_directives || {}),
  }

  const directive_ns = options.directive_ns || 'data'
  /* istanbul ignore else  */
  if( add_directives.if ) addDirectiveIf(APP, directive_ns)
  /* istanbul ignore else  */
  if( add_directives.repeat ) addDirectiveRepeat(APP, directive_ns)
  /* istanbul ignore else  */
  if( add_directives.bind ) addDirectiveBind(APP, directive_ns)
  /* istanbul ignore else  */
  if( add_directives.on ) addDirectiveOn(APP, directive_ns)
  /* istanbul ignore else  */
  if( add_directives['class'] ) addDirectiveClass(APP, directive_ns)

  APP.withNode(function (node) {
    var text_node = node && typeof node.text === 'string' ? node.text : null

    if( text_node ) return {
      replace_text: '',
      initNode (el) {
        var renderText = APP.interpolate(text_node),
            parent_el = el.parentElement || /* istanbul ignore next: IE */ el.parentNode

        if( parent_el && /{{.*}}/.test(text_node) ) {
          parent_el.insertBefore( document.createComment(' text: ' + text_node + ' '), el )
        }

        function _onData (data) {
          var text = renderText(data).replace(/&([a-z]+);/g, _replaceSpecialChars)
          if( text !== el.textContent ) el.textContent = text
        }

        this.watchData(_onData)
      },
    }
  })

}

TriskelApp.prototype = Object.create(RenderApp.prototype)
TriskelApp.prototype.constructor = TriskelApp

function _renderApp (_parent, _nodes, render_options) {

  render_options = Object.create(render_options || {})

  var APP_ = Object.create(this),
      data = render_options.data || {}

  var data_listeners = [],
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

  var inserted_nodes = APP.super.render.apply(APP_, arguments)

  return {
    get data () {
      return data
    },
    set data (_data) {
      updateData(_data)
    },
    updateData,
    inserted_nodes,
  }

}

TriskelApp.prototype.render = _renderApp

const APP = new TriskelApp()

export default APP

// export function createApp(options) {
//   options = options || {}

//   var add_directives = {
//         if: true,
//         repeat: true,
//         bind: true,
//         on: true,
//         'class': true,
//         ...(options.add_directives || {}),
//       }

//   var app = new RenderApp()

//   // Data envelope for RenderApp

//   var APP = Object.create( app ),
//       TEXT = ConText(APP)

//   var special_chars = {
//     nbsp: '\u00a0', hellip: '…', quot: '"', amp: '&',
//   }

//   function _replaceSpecialChars (matched, special_char) {
//     return special_char in special_chars
//       ? special_chars[special_char]
//       : matched
//   }

//   APP.withNode(function (node) {
//     var text_node = node && typeof node.text === 'string' ? node.text : null

//     if( text_node ) return {
//       replace_text: '',
//       initNode: function (el) {
//         var renderText = TEXT.interpolate(text_node),
//             parent_el = el.parentElement || /* istanbul ignore next: IE */ el.parentNode

//         if( parent_el && /{{.*}}/.test(text_node) ) parent_el.insertBefore( document.createComment(' text: ' + text_node + ' '), el )

//         this.watchData(function (data) {
//           var text = renderText(data).replace(/&([a-z]+);/g, _replaceSpecialChars)
//           if( text !== el.textContent ) el.textContent = text
//         })
//       },
//     }
//   })

//   const directive_ns = options.directive_ns || 'data'
//   /* istanbul ignore else  */
//   if( add_directives.if ) addDirectiveIf(APP, TEXT, directive_ns)
//   /* istanbul ignore else  */
//   if( add_directives.repeat ) addDirectiveRepeat(APP, TEXT, directive_ns)
//   /* istanbul ignore else  */
//   if( add_directives.bind ) addDirectiveBind(APP, TEXT, directive_ns)
//   /* istanbul ignore else  */
//   if( add_directives.on ) addDirectiveOn(APP, TEXT, directive_ns)
//   /* istanbul ignore else  */
//   if( add_directives['class'] ) addDirectiveClass(APP, TEXT, directive_ns)

//   function _renderApp (_parent, _nodes, render_options) {

//     render_options = Object.create(render_options || {})

//     var APP_ = Object.create(this),
//         // parent_app = render_options.parent_app || {},
//         data = render_options.data || {},
//         data_listeners = [],
//         watchData = function (onData) {
//           data_listeners.push(onData)
//           onData(data)
//         },
//         updateData = function (_data) {
//           if( _data ) data = _data
//           data_listeners.forEach(function (listener) {
//             listener(data)
//           })
//         }

//     APP_.render_app = APP_.render_app || APP_
//     APP_.watchData = watchData
//     APP_.updateData = updateData
//     APP_.render = _renderApp.bind(APP_)

//     var inserted_nodes = app.render.apply(APP_, arguments)

//     return {
//       get data () {
//         return data
//       },
//       set data (_data) {
//         updateData(_data)
//       },
//       updateData: updateData,
//       inserted_nodes: inserted_nodes,
//     }

//   }

//   APP.render = _renderApp.bind(APP)

//   return APP
// }
