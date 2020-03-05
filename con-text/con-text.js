/**
 * @module con-text
 */

import { evalExpression } from './eval'
import { interpolateText } from './interpolate'
import { filterProcessor, defineFilter, parseExpressionFilters } from './filters'
import { pipeProcessor } from '../_utils/list'

export default new ConText()

/**
 * Creates an isolated filters context for evaluating strings
 * 
 * @class
 * @param {*} [target] - only pass a target when not creating a new ConText instance, otherwise it will drop an exception
 * 
 * @example
 * 
 * import { ConText } from '@triskel/con-text'
 * 
 * const TEXT = new ConText()
 * 
 * TEXT.defineFilter('foo', (input) => input + ':foo' )
 * 
 * TEXT.eval(' name | foo', { name: 'John' })
 * // return 'John:foo'
 */
export function ConText(target) {
  if (arguments.length) {
    if (this instanceof ConText) throw new TypeError('can not use target with constructor')
    return createConText(target)
  }

  if (this instanceof ConText === false) throw new TypeError('target missing when not using constructor')

  return createConText(this)
}

export function createConText(TEXT = {}) {
  if (!TEXT || (typeof TEXT !== 'object' && typeof TEXT !== 'function')) {
    throw new TypeError('target should be an (non-null) Object or a Function')
  }

  var filter_definitions = {}

  var _processFilter = filterProcessor(filter_definitions)

  function _defineFilter(filter_name, processFilter) {
    if (typeof filter_name === 'object') {
      for (let key in filter_name) _defineFilter(key, filter_name[key])
    } else {
      defineFilter(filter_definitions, filter_name, processFilter)
    }
    return TEXT
  }

  function _parseExpression(expression) {
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

          return (input, data) => _processFilter(filter.name, input, _getFilterData(data))
        }),
    }
  }

  TEXT.defineFilter = _defineFilter
  TEXT.processFilter = _processFilter

  TEXT.parseExpression = _parseExpression

  function _evalExpression(expression, data) {
    var _parsed = _parseExpression(expression),
      _getData = evalExpression(_parsed.expression)

    if (arguments.length < 2) {
      if (!_parsed.filters.length) return _getData

      return function _renderExpression(_scope) {
        return _parsed.processFilters(_getData(_scope), _scope)
      }
    }

    return _parsed.processFilters(_getData(data), data)
  }

  function _interpolateExpression(text, data) {
    const renderExpressions = interpolateText(text, _evalExpression)

    return arguments.length > 1
      ? renderExpressions((renderExpression) => renderExpression(data))
      : function _renderText(data) {
        return renderExpressions((renderExpression) => renderExpression(data))
      }
  }

  TEXT.interpolate = _interpolateExpression
  TEXT.eval = _evalExpression

  return TEXT
}
