

function _mapExpression (expression) {
  return { expression }
}

export function tokenizeExpressions (text, mapExpression = _mapExpression) {
  return text
    .split(/{{(.*?)}}/)
    .map( (token, i) => {
      return i%2
        ? mapExpression(token)
        : token
    })
}

export function stringifyTokens (tokens, processExpression) {
  return tokens
    .map( (token, i) => {
      return i%2
        ? processExpression(token)
        : token
    })
    .join('')
}

export function interpolateText (text, mapExpression) {
  const tokens = tokenizeExpressions(text, mapExpression)

  return function _renderText (mapToken) {
    return stringifyTokens(tokens, (token) => mapToken(token) )
  }
}
