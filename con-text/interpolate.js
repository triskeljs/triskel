

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

// export function interpolateText (text, processExpression) {
//   var tokens = tokenizeExpressions(text, processExpression)

//   return function _renderTokens () {
//     return tokens
//       .map( (token) => {

//       })
//   }

//   return processExpression
//     ? stringifyTokens(tokens, processExpression)
//     : function (processExpression) {
//       return stringifyTokens(tokens, processExpression)
//     }
// }

// export function interpolateProcessor (processExpression) {
//   return function _interpolateText (text, scope, filters_scope) {
//     const tokens = tokenizeExpressions(text)

//     return arguments.length > 1
//       stringifyTokens(tokens, processExpression)

//     return stringifyTokens(
//       tokenizeExpressions(text),
//       processExpression,
//     )
//   }
// }
