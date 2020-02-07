
function _parseTag (tag_str, options) {
  var tag = { attrs: {}, _: [], unclosed: true }

  tag_str
    .replace(/^<|>$/g, '')
    .replace(/ *\/$/, function () {
      delete tag.unclosed
      tag.self_closed = true
      return ''
    })
    .replace(/^\//, function () {
      if( tag.self_closed ) throw new Error('tag closer self_closed: ' + tag_str )
      tag.closer = true
      return ''
    })
    .replace(/^[^ ]+/, function (node_name) {
      tag.$ = node_name.trim()
      if( /^!/.test(node_name) ) tag.warn = true
      return ''
    })
    .replace(/\b([^= ]+) *= *"([^"]*?)"|\b([^= ]+) *= *'([^']*?)'/g, function (_matched, attribute, value) {
      attribute = attribute.trim()
      if( attribute === 'style' ) value = value.replace(/([:;])\s+/g, '$1')
      if( options.compress_attibutes !== false ) value = value.replace(/ *\n */g, '').trim()
      tag.attrs[attribute] = value
      return ''
    })
    .split(/ +/)
    .forEach(function (empty_attr) {
      empty_attr = empty_attr.trim()
      if( !empty_attr ) return
      tag.attrs[empty_attr] = ''
    })

  return tag
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

  // console.log('tokens', tokens );
  // console.log('_fixTokens', _fixTokens( tokens ) );

  return _fixTokens( html.split(/(<[^>]+?>)/g) )
}

function _parseHTML (html, nodes, node_opened, options) {
  options = options || {}

  _tokenize(html).forEach(function (tag, i) {

    if( !(i%2) ) {
      if( /\S/.test(tag) ) node_opened._.push( _trimText(tag) )
      return
    }

    tag = _parseTag(tag, options)

    if( tag.closer ) {
      if( tag.$ !== node_opened.$ ) throw new Error('tag closer \'' + tag.$ + '\' for \'' + node_opened.$ + '\'' )
      delete node_opened.unclosed
      node_opened = node_opened._parent
    } else if( tag.self_closed ) {
      node_opened._.push(tag)
    } else {
      tag._parent = node_opened
      // tag._ = [];
      node_opened._.push(tag)
      node_opened = tag
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
  nodes.forEach(function (tag) {
    // avoiding circular structure
    delete tag._parent

    // removing temporary tester
    delete tag.match_closer

    // cleaning empty attributes
    if( tag.attrs && Object.keys(tag.attrs).length === 0 ) delete tag.attrs

    // cleaning empty children
    if( tag._ instanceof Array ) {
      if( !tag._.length ) delete tag._
      else if( tag._.length === 1 && typeof tag._[0] === 'string' ) tag._ = tag._[0]
      else _cleanNodes(tag._)
    }

  })
  return nodes
}

function parseHTML (html, options) {

  var tag_opened = null,
      nodes = [],
      last_parse = { node_opened: { _: nodes } }

  options = options || {}

  _fixTokens(html.split(RE_full_content)).forEach(function (token, i) {

    if( !(i%2) ) {
      if( tag_opened ) {
        if( 'comments' in tag_opened ) tag_opened.comments += token
        else if( typeof tag_opened._ === 'string' ) tag_opened._ += token
        else tag_opened._ = token
      } else last_parse = _parseHTML(token, nodes, last_parse.node_opened || { $: '__root__', _: nodes }, options)
      return
    }


    if( tag_opened ) {
      if( tag_opened.match_closer.test(token) ) {
        delete tag_opened.unclosed
        tag_opened = null
      } else {
        if( 'comments' in tag_opened ) tag_opened.comments += token
        else if( typeof tag_opened._ === 'string' ) tag_opened._ += token
        else tag_opened._ = token
      }
    } else {
      if( token === '<!--' ) tag_opened = { comments: '', match_closer: /^-->$/, unclosed: true }
      else {
        tag_opened = _parseTag(token, options)
        tag_opened.match_closer = new RegExp('^<\\/ *' + tag_opened.$ + ' *>$')
      }

      if( token === '-->' ) throw new Error('unexpected comments closer \'-->\'')
      if( tag_opened.closer ) throw new Error('unexpected tag closer \'' + token + '\'')

      if( !('comments' in tag_opened) || !options.remove_comments ){
        last_parse.node_opened._.push(tag_opened)
      }
    }

  })

  if( !options.ignore_unclosed && last_parse.node_opened && last_parse.node_opened.unclosed && !last_parse.node_opened.warn ) {
    throw new Error('tab unclosed \'' + last_parse.node_opened.$ + '\'')
  }

  return _cleanNodes(nodes)
}

module.exports = parseHTML
