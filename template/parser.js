
var EXPRESSION = /^\$(\w*){([^}]*)}$/,
  ELSE = /^{:}|{else}$/,
  CLOSE = /^{\/(\w*)}$/

var split_RE = new RegExp('(' +
  EXPRESSION.source.substr(1).replace(/\$$|\(|\)/g, '') + '|' +
  ELSE.source.substr(1).replace(/\$$/, '') + '|' +
  CLOSE.source.substr(1).replace(/\$$|\(|\)/g, '') +
  ')', 'g')

var empty_raised = { chunks: [] }

function _raiseContent(last_expression, key, next_raised) {
  if (next_raised.chunks.length === 1 && typeof next_raised.chunks[0] === 'string') {
    last_expression[key] = next_raised.chunks[0]

  } else if (next_raised.chunks.length > 0) {
    last_expression[key] = next_raised.chunks
  }

  return next_raised
}

function _selfClosedChunk(statement, expression) {
  var chunk = { $$: expression }
  if (statement) chunk.$ = statement
  return chunk
}

function _raiseTokens(tokens, self_closed_statements, _i) {
  var chunks = [], current_expression, matched_expression, next_raised,
    raised = { chunks: chunks },
    last_expression = null

  for (var i = _i || 0, n = tokens.length - 1; i <= n; i++) {
    if (tokens[i]) chunks.push(tokens[i++])
    else i++

    if (i > n) break

    current_expression = tokens[i]

    /* istanbul ignore else */
    if (EXPRESSION.test(current_expression)) {
      matched_expression = current_expression.match(EXPRESSION)

      // if (!matched_expression) throw new Error('"' + current_expression + '" is not a valid expression')

      if (self_closed_statements[matched_expression[1]] || !matched_expression[1]) {
        chunks.push(_selfClosedChunk(matched_expression[1], matched_expression[2]))
      } else {
        last_expression = { $: matched_expression[1], $$: matched_expression[2] }

        next_raised = _raiseContent(last_expression, '_', i <= n && _raiseTokens(tokens, self_closed_statements, i + 1) || empty_raised)

        if ('index' in next_raised) i = next_raised.index

        if (next_raised.otherwise) {
          next_raised = _raiseContent(last_expression, '__', i <= n && _raiseTokens(tokens, self_closed_statements, i + 1) || empty_raised)

          if ('index' in next_raised) i = next_raised.index
        }

        if (next_raised.closed) {
          chunks.push(last_expression)
          last_expression = null
        }
      }

    } else if (ELSE.test(current_expression)) {

      if (last_expression) chunks.push(last_expression)

      raised.otherwise = true
      raised.index = i
      return raised

    } else if (CLOSE.test(current_expression)) {

      if (!_i) throw new Error('Unexpected close token ' + current_expression)

      if (last_expression) chunks.push(last_expression)

      raised.closed = true

      raised.index = i
      return raised
    } else throw new Error('Unknow expression type: ' + current_expression)
  }

  return raised
}

export default function parseHTML (template_str, self_closed_statements) {
  return _raiseTokens(template_str.split(split_RE), self_closed_statements || {}).chunks
}
