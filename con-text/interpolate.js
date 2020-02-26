

function _mapExpression (expression) {
  return { expression }
}

export function tokenizeExpressions (expression, mapExpression = _mapExpression) {
  if (typeof expression !== 'string') throw new Error('expression should be a String')
  return expression
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

export function interpolateText (expression, mapExpression) {
  if (typeof expression !== 'string') throw new Error('expression should be a String')
  const tokens = tokenizeExpressions(expression, mapExpression)

  return function _renderText (mapToken) {
    return stringifyTokens(tokens, (token) => mapToken(token) )
  }
}
