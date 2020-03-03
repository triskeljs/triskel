
import parseHTML from '@triskel/parser'
import JSON5 from 'json5'

function html2js (html, options) {
  return JSON5.stringify( parseHTML(html, options) )
}

function loader (html, options) {
  options = Object.create(options || {})

  if( options.remove_comments === undefined ) options.remove_comments = true

  return (options.cjs ? 'module.exports = ' : 'export default ') + html2js(html, options) + ';'
}

loader.html2js = html2js

module.exports = loader
