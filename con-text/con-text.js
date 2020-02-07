
import { evalExpression } from './eval'
import { interpolateProcessor } from './interpolate'
import { filterProcessor, defineFilter, expressionFilterProcessor } from './filters'

export default new ConText()

export function ConText (target) {
  if( target ) {
    if( this instanceof ConText ) throw new Error('can not use target with constructor')
    return createConText(target)
  }
  
  if( this instanceof ConText === false ) throw new Error('target missing when not using constructor')

  return createConText(this)
}

export function createConText (_TEXT = {}) {

  var filter_definitions = {}

  var _processFilter = filterProcessor(filter_definitions)

  var _parseExpression = expressionFilterProcessor(function (filter, input, data = {}) {
    var _data = filter.expression && evalExpression(filter.expression)(data)

    return filter.expression
      ? _processFilter(filter.name, input, _data)
      : _processFilter(filter.name, input)
  })

  function _evalExpression (expression, scope, filters_scope) {
    var _parsed = _parseExpression(expression),
        _getData = evalExpression( _parsed.expression )

    if( arguments.length < 2 ) {
      if( !_parsed.has_filters ) return _getData

      return function (_scope, _filters_scope) {
        return _parsed.processFilters( _getData(_scope), _filters_scope || _scope )
      }
    }

    return _parsed.processFilters( _getData(scope), filters_scope || scope )
  }
  
  _TEXT.eval = _evalExpression
  _TEXT.interpolate = interpolateProcessor(_evalExpression)

  _TEXT.parseExpression = _parseExpression

  _TEXT.defineFilter = function _defineFilter (filter_name, processFilter) {
    defineFilter(filter_definitions, filter_name, processFilter)
    return _TEXT
  }
  _TEXT.processFilter = _processFilter

  return _TEXT
}
