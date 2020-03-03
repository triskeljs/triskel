/* eslint-env node */

function _parseTag (tag_str, options) {
  var node = { attrs: {}, content: [], unclosed: true }

  tag_str
    .replace(/^<|>$/g, '')
    .replace(/ *\/$/, function () {
      delete node.unclosed
      node.self_closed = true
      return ''
    })
    .replace(/^\//, function () {
      if( node.self_closed ) throw new Error('tag closer self_closed: ' + tag_str )
      node.closer = true
      return ''
    })
    .replace(/^[^ ]+/, function (node_name) {
      node.tag = node_name.trim()
      if( /^!/.test(node_name) ) node.warn = true
      return ''
    })
    .replace(/\b([^= ]+) *= *"([^"]*?)"|\b([^= ]+) *= *'([^']*?)'/g, function (_matched, attribute, value) {
      if (!attribute) return ''
      attribute = attribute.trim()
      if( attribute === 'style' ) value = value.replace(/([:;])\s+/g, '$1')
      if( options.compress_attributes !== false ) value = value.replace(/ *\n */g, '').trim()
      node.attrs[attribute] = value
      return ''
    })
    .split(/ +/)
    .forEach(function (empty_attr) {
      empty_attr = empty_attr.trim()
      if( !empty_attr ) return
      node.attrs[empty_attr] = ''
    })

  return node
}

function _trimText (text) {
  return text.replace(/ *\n+ */g, '')
}

function _fixTokens (tokens) {
  var fixed_tokens = [ tokens[0] ],
      close_double_quote = false,
      close_single_quote = false

  for( var i = 1, n = tokens.length; i < n ; i++ ) {
    // if( /="[^"]+>$/.test(tokens[i]) ) {
    //   // fixed_tokens[fixed_tokens.length - 1] += tokens[i];
    //   fixed_tokens[fixed_tokens.length - 1] += tokens[i];
    //   close_next = true;
    // } else

    if( close_single_quote ) {
      if( /'/.test(tokens[i]) ) {
        close_double_quote = false
        tokens[i].replace(/([^']*'[^>]*>)(.*)/, function (_matched, tail, next) {
          fixed_tokens[fixed_tokens.length - 1] += tail
          fixed_tokens.push(next)
        })
      } else {
        fixed_tokens[fixed_tokens.length - 1] += tokens[i]
      }
    } else if( close_double_quote ) {
      if( /"/.test(tokens[i]) ) {
        close_double_quote = false
        tokens[i].replace(/([^"]*"[^>]*>)(.*)/, function (_matched, tail, next) {
          fixed_tokens[fixed_tokens.length - 1] += tail
          fixed_tokens.push(next)
        })
      } else {
        fixed_tokens[fixed_tokens.length - 1] += tokens[i]
      }
    } else {
      fixed_tokens.push(tokens[i])
    }
    if( /="[^"]*>$/.test(tokens[i]) ) close_double_quote = true
    else if( /='[^']*>$/.test(tokens[i]) ) close_single_quote = true
  }

  return fixed_tokens
}

function _tokenize (html) {
  // var tokens = html.split(/(<[^>]+?>)/g);

  return _fixTokens( html.split(/(<[^>]+?>)/g) )
}

function _parseHTML (html, nodes, node_opened, options) {
  options = options || {}

  const tokens = _tokenize(html)

  tokens.forEach(function (token, i) {

    if( !(i%2) ) {
      if( /\S/.test(token) ) node_opened.content.push( _trimText(token) )
      return
    }

    const node = _parseTag(token, options)

    if( node.closer ) {
      if( node.tag !== node_opened.tag && !options.ignore_bad_closed ) throw new Error('tag closer \'' + node.tag + '\' for \'' + node_opened.tag + '\'' )
      delete node_opened.unclosed
      node_opened = node_opened._parent
    } else if( node.self_closed ) {
      node_opened.content.push(node)
    } else {
      node._parent = node_opened
      // tag._ = [];
      node_opened.content.push(node)
      node_opened = node
    }

  })

  return {
    nodes: nodes,
    node_opened: node_opened,
  }
}

var full_content_tags = [
  'script',
  'style',
  'code',
]

var RE_full_content = new RegExp( '(' + '<!--|-->|' + full_content_tags.map(function (tag_name) {
  return '<' + tag_name + '[^>]*>|<\\/' + tag_name + '>'
}).join('|') + ')', 'g')

function _cleanNodes (nodes) {
  nodes.forEach(function (node) {
    // avoiding circular structure
    delete node._parent

    // removing temporary tester
    delete node.match_closer

    // cleaning empty attributes
    if( node.attrs && Object.keys(node.attrs).length === 0 ) delete node.attrs

    // cleaning empty children
    if( node.content instanceof Array ) {
      if( !node.content.length ) delete node.content
      // else if( node.content.length === 1 && typeof node.content[0] === 'string' ) node.content = node.content[0]
      else _cleanNodes(node.content)
    }

  })
  return nodes
}

export default function parseHTML (html, options) {

  var tag_opened = null,
      nodes = [],
      last_parse = { node_opened: { content: nodes } }

  options = options || {}

  _fixTokens(html.split(RE_full_content)).forEach(function (token, i) {

    if( !(i%2) ) {
      if( tag_opened ) {
        if( 'comments' in tag_opened ) tag_opened.comments += token
        // else if( typeof tag_opened.content === 'string' ) tag_opened.content += token
        else tag_opened.content = [token]
      } else last_parse = _parseHTML(token, nodes, last_parse.node_opened || { tag: '__root__', content: nodes }, options)
      return
    }


    if( tag_opened ) {
      if( tag_opened.match_closer.test(token) ) {
        delete tag_opened.unclosed
        tag_opened = null
      } else {
        if( 'comments' in tag_opened ) tag_opened.comments += token
        // else if( typeof tag_opened.content === 'string' ) tag_opened.content += token
        else tag_opened.content = [token]
      }
    } else {
      if( token === '<!--' ) tag_opened = { comments: '', match_closer: /^-->$/, unclosed: true }
      else {
        tag_opened = _parseTag(token, options)
        tag_opened.match_closer = new RegExp('^<\\/ *' + tag_opened.tag + ' *>$')
      }

      if( token === '-->' && !options.ignore_bad_closed ) throw new Error('unexpected comments closer \'-->\'')
      if( tag_opened.closer && !options.ignore_bad_closed ) throw new Error('unexpected tag closer \'' + token + '\'')

      if( !('comments' in tag_opened) || !options.remove_comments ){
        last_parse.node_opened.content.push(tag_opened)
      }
    }

  })

  if( !options.ignore_unclosed && last_parse.node_opened && last_parse.node_opened.unclosed && !last_parse.node_opened.warn ) {
    throw new Error('tag unclosed \'' + last_parse.node_opened.tag + '\'')
  }

  return _cleanNodes(nodes)
}
