
import assert from 'assert'

import { tokenizeExpressions, stringifyTokens, interpolateText } from './interpolate'

/** define-property */
describe(__filename.substr(process.cwd()), function () {
// --------------------------------------

var expression_tokens = [

  ['foo {{ foobar }} bar', [
      'foo ', { expression: ' foobar ' }, ' bar',
  ] ],
  ['foo {{ foobar }} bar {{ barfoo }} tail', [
      'foo ', { expression: ' foobar ' }, ' bar ', { expression: ' barfoo ' }, ' tail',
  ] ],
  [`foo {{ foobar: { inner: 'curly_brackets' } }} bar`, [
      'foo ', { expression: ' foobar: { inner: \'curly_brackets\' } ' }, ' bar',
  ] ],
  [`foo {{ foobar: { inner: ['brackets'] } }} bar`, [
    'foo ', { expression: ' foobar: { inner: [\'brackets\'] } ' }, ' bar',
] ],

]

describe('tokenizeExpressions', function () {

    function _runTestCase (input, tokens) {
        it(input, function () {
            assert.deepStrictEqual(
                tokenizeExpressions(input),
                tokens
            )
        })
    }
    
    expression_tokens.forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

function _toExpresion (token) {
  return typeof token === 'string' ? token : `{{${ token.expression }}}`
}

describe('stringifyTokens', function () {

  function _runTestCase (input, tokens) {
      it( tokens.map(_toExpresion).join(''), function () {
          assert.strictEqual(
            stringifyTokens(tokens, (expression) => `{{${ expression }}}` ),
            input
          )
      })
  }
  
  expression_tokens.forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

describe('interpolateText', function () {

  function _runTestCase (input, tokens) {
      it( tokens.map(_toExpresion).join(''), function () {
          assert.strictEqual(
            interpolateText(input, (expression) => `{{${ expression }}}` ),
            input, 'direct'
          )
          assert.strictEqual(
            interpolateText(input)( (expression) => `{{${ expression }}}` ),
            input, 'currying'
          )
      })
  }
  
  expression_tokens.forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

/** */
})
/** */
