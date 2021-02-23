
export function defineFilter (filter_definitions, filter_name, filterProcessor) {
  if (typeof filter_definitions !== 'object' && typeof filter_definitions !== 'function') {
    throw new TypeError('filter_definitions should be an Object')
  }
  if (typeof filter_name !== 'string') throw new TypeError('filter_name should be a String')
  if (typeof filterProcessor !== 'function') throw new TypeError('filterProcessor should be a Function')

  filter_definitions[filter_name] = filterProcessor
}

export function _processFilter (filter_name, input, data) {
  if (!arguments.length) throw new Error('missing filter_name')
  if (!this[filter_name]) throw new Error('filter \'' + filter_name + '\' is not defined')

  return this[filter_name](input, data)
}

export function filterProcessor (filter_definitions) {
  if (!arguments.length) throw new Error('missing filter_definitions')

  return _processFilter.bind(filter_definitions)
}

export function splitPipes (text) {
  var str = text.split('|')
  var result = []

  for (var i = 0, n = str.length; i < n; i++) {
    result.push(
      str[i + 1] === ''
        ? (str[i++] + '||' + str[++i])
        : str[i],
    )
  }

  return result
}

export function parseFilter (filter_str) {
  var filter_key = filter_str.split(/:(.+)/)

  return filter_key[1]
    ? { name: filter_key[0].trim(), expression: filter_key[1].trim() }
    : { name: filter_key[0].trim() }
}

export function parseExpressionFilters (expression) {
  if (typeof expression !== 'string') throw new Error('expression should be a String')
  var _filters = splitPipes(expression)

  return {
    expression: _filters[0],
    filters: _filters.slice(1).map(parseFilter),
  }
}
