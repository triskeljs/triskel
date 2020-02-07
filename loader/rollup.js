
const triskelLoader = require('./loader')
const minimatch = require('minimatch')

function createFilter (include_pattern, exlude_pattern, minimatch_options = {}) {

  return function _pathMatches (filepath) {
    var is_included = !include_pattern || minimatch(filepath, include_pattern, minimatch_options)

    if( !exlude_pattern ) return is_included

    return !minimatch(filepath, exlude_pattern, minimatch_options)
  }
}

exports.createFilter = createFilter

module.exports = function triskel(options = {}) {
  if( !options.include ) options.include = '**/*.html'

  const matchesPatterns = createFilter(options.include, options.exclude)
  
  return {
    name: 'triskel',

    transform(html, filepath) {
      if( !matchesPatterns(filepath) ) return null

      return {
        code: triskelLoader(html),
        map: { mappings: '' }
      }
    }
  }
}
