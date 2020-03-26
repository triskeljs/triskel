
export function _appendChildren (parent_el, nodes, ns_scheme, options, _withNode, inits_list) {
  var inserted_nodes = []

  for( var i = 0, n = nodes.length, node ; i < n ; i++ ) {
    node = nodes[i]

    if( typeof node === 'string' ) node = { text: node }
    if( options.remove_comments && node && typeof node === 'object' && 'comments' in node ) break

    var with_node = _withNode(node) || {}
    var node_el

    if( with_node.replace_by_comment ) node_el = document.createComment(with_node.replace_by_comment)
    else node_el = _create(node, ns_scheme, options, _withNode, inits_list, with_node.replace_text)

    if( with_node.onCreate instanceof Function ) {
      with_node.onCreate.call(node_el, node_el, node, options)
    }

    parent_el.appendChild( node_el )

    if( with_node.initNode ) {
      if( typeof with_node.initNode !== 'function' ) throw new TypeError('initNode should be a Function')
      inits_list.push({
        fn: with_node.initNode,
        _this: node_el,
        _args: [node_el, node, options],
      })
    }

    inserted_nodes.push({
      el: node_el,
      options: node,
      with_node: with_node,
    })

  }

  return inserted_nodes
}

var ns_tags = {
  svg: 'http://www.w3.org/2000/svg',
  xbl: 'http://www.mozilla.org/xbl',
  xul: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
}

export function _create(node, ns_scheme, options, _withNode, inits_list, replace_text) {
  var node_el, attr_value

  if( 'text' in node ) return document.createTextNode( replace_text === undefined ? node.text : replace_text )
  if( 'comments' in node ) return document.createComment(node.comments)

  if( !node.tag ) throw new TypeError('unknown node format')

  ns_scheme = ns_scheme || ns_tags[node.tag]
  if( ns_scheme ) node_el = document.createElementNS(ns_scheme, node.tag)
  else node_el = document.createElement(node.tag)

  if( node.attrs ) {
    for( var key in node.attrs ) {
      if( node.attrs[key] instanceof Function ) {
        attr_value = node.attrs[key](options, node)
        if( attr_value === null ) delete node.attrs[key]
        else node_el.setAttribute(key, attr_value)
      } else {
        node_el.setAttribute(key, node.attrs[key] )
      }
    }
  }

  if( 'content' in node ) {
    _appendChildren(
      node_el,
      node.content instanceof Array
        ? node.content
        : [node.content],
      ns_scheme,
      options,
      _withNode,
      inits_list,
    )
  }

  return node_el
}

function _runInits (init_node) { init_node.fn.apply(init_node._this, init_node._args) }

/**
 * Render TriskelAST as DOM tree into an HTMLElement
 * 
 * @param {HTMLElement} parent_el 
 * @param {TriskelAST} nodes 
 * @param {*} [options]
 * 
 * @example
 * 
 * import renderNodes from '@triskel/app/render'
 * 
 * renderNodes(document.body, [
 *  { tag: 'div', attrs: { class: 'foo' }, content: ['bar] },
 * ])
 * // document.body.innerHTML results:
 * // <div class="foo">bar</div>
 */
export default function renderNodes (parent_el, nodes, options) {
  options = Object.create(options || {})
  var _withNode = options.withNode || function __withNode () {}
  var _insert_before = options.insert_before

  options.withNode = null
  options.insert_before = null

  if( !_insert_before && options.keep_content !== true ) {
    while( parent_el.firstChild )
    parent_el.removeChild(parent_el.firstChild)
  }

  if( !nodes.length ) return []

  var _dom_fragment = document.createDocumentFragment()

  var inits_list = [],
      inserted_nodes = _appendChildren(_dom_fragment, nodes, null, options, _withNode, inits_list)

  if( _insert_before ) parent_el.insertBefore(_dom_fragment, _insert_before)
  else parent_el.appendChild(_dom_fragment)

  inits_list.forEach(_runInits)

  return inserted_nodes
}
