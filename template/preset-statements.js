
var EACH = / *([^,]+)(\s*,\s*([\S]+))? in (\S+)/

export default {
  if (expression, scope, renderContent, renderOtherwise) {
    if (this.eval(expression)(scope)) return renderContent(scope)
    return renderOtherwise(scope)
  },
  each (expression, scope, renderContent) {
    var expressions = expression.match(EACH), key, i, n, s

    if (!expressions) throw new Error('each expression is not correct "' + expression + '"')

    var result = '',
      item_key = expressions[1],
      items = this.eval(expressions[4])(scope),
      i_key = expressions[3] || (items instanceof Array ? '$index' : '$key')

    if (!items || (!(items instanceof Array) && typeof items !== 'object')) throw new TypeError('list in expression should be a non null Object or an Array')

    if (items instanceof Array) {
      for (i = 0, n = items.length; i < n; i++) {
        s = Object.create(scope)
        s[i_key] = i
        s[item_key] = items[i]
        result += renderContent(s)
      }
    } else {
      for (key in items) {
        s = Object.create(scope)
        s[i_key] = key
        s[item_key] = items[key]
        result += renderContent(s)
      }
    }

    return result
  },
}
