
export function tokenizeExpressions (text) {
  return text.split(/{{(.*?)}}/).map( (token, i) => i%2 ? { expression: token } : token )
}

export function stringifyTokens (tokens, processExpression) {
  return tokens.map( (token) => typeof token === 'string' ? token : processExpression(token.expression) ).join('')
}

export function interpolateText (text, processExpression) {
  var tokens = tokenizeExpressions(text)

  return processExpression
    ? stringifyTokens(tokens, processExpression)
    : function (processExpression) {
      return stringifyTokens(tokens, processExpression)
    }
}

export function interpolateProcessor (processExpression) {
  return function interpolateText (text) {
    return stringifyTokens(
      tokenizeExpressions(text),
      processExpression
    )
  }
}
