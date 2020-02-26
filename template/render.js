
// var Scope = require('./scope');

function _renderTokens(con_Text, tokens_list, scope, statements) {

  return tokens_list.reduce(function (result, token) {
    if (typeof token === 'string') return result + token

    if (!token.$$) throw new Error('Unrecognized token type')

    if (!token.$) {  // ${ expression } special case
      return result + con_Text.eval(token.$$)(scope)
    }

    if (!statements[token.$]) throw new Error('Unrecognized command')

    return result + statements[token.$].call(con_Text, token.$$, scope, function renderContent(_scope) {
      if (typeof token._ === 'string') return token._
      return _renderTokens(con_Text, token._, _scope, statements)
    }, function renderOtherwise(_scope) {
      if (typeof token.__ === 'string') return token.__
      return _renderTokens(con_Text, token.__ || [], _scope, statements)
    })

  }, '')
}

export default function renderTokens(con_Text, tokens_list, data, statements) {
  if (!(tokens_list instanceof Array)) throw new TypeError('tokens list should be an Array')

  return _renderTokens(con_Text, tokens_list, data || {}, statements || {})
}
