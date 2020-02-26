
import { evalExpression } from './eval'
import { interpolateText } from './interpolate'
import { filterProcessor, defineFilter, parseExpressionFilters } from './filters'
import { pipeProcessor } from '../_common/list'

export default new ConText()

export function ConText (target) {
  if( target ) {
    if( this instanceof ConText ) throw new Error('can not use target with constructor')
    return createConText(target)
  }
  
  if( this instanceof ConText === false ) throw new Error('target missing when not using constructor')

  return createConText(this)
}

export function createConText (TEXT = {}) {

  var filter_definitions = {}

  var _processFilter = filterProcessor(filter_definitions)

  function _defineFilter (filter_name, processFilter) {
    if (typeof filter_name === 'object') {
      for (let key in filter_name ) _defineFilter(key, filter_name[key])
    } else {
      defineFilter(filter_definitions, filter_name, processFilter)
    }
    return TEXT
  }

  function _parseExpression (expression) {
    const parsed = parseExpressionFilters(expression)

    return {
      expression: parsed.expression,
      filters: parsed.filters,
      processFilters: !parsed.filters.length
        ? (input) => input
        : pipeProcessor(parsed.filters, (filter) => {
          const _getFilterData = filter.expression
            ? evalExpression(filter.expression)
            : () => null

          return (input, data) => _processFilter(filter.name, input, _getFilterData(data) )
        }),
    }
  }

  TEXT.defineFilter = _defineFilter
  TEXT.parseExpression = _parseExpression

  function _evalExpression (expression, scope ) {
    var _parsed = _parseExpression(expression),
        _getData = evalExpression( _parsed.expression )

    if( arguments.length < 2 ) {
      if( !_parsed.filters.length ) return _getData

      return function _renderExpression (_scope) {
        return _parsed.processFilters( _getData(_scope), _scope )
      }
    }

    return _parsed.processFilters( _getData(scope), scope )
  }
  
  TEXT.eval = _evalExpression
  TEXT.interpolate = function _interpolate (text, _scope, _filters_scope) {
    const renderExpressions = interpolateText(text, _evalExpression)

    return arguments > 1
      ? renderExpressions( (renderExpression) => renderExpression(_scope, _filters_scope) )
      : function _renderText (scope, filters_scope) {
        return renderExpressions( (renderExpression) => renderExpression(scope, filters_scope) )
      }
  }

  TEXT.processFilter = _processFilter

  return TEXT
}
