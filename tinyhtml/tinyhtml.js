
import parseHTML from '@triskel/parser'
import stringifyNodes from '@triskel/stringify'

function tinyhtml (html, options) {
  return stringifyNodes( parseHTML(html, options), options )
}

tinyhtml.parse = parseHTML
tinyhtml.stringify = stringifyNodes

export default tinyhtml
