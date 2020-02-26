
import assert from 'assert'

import { tokenizeExpressions, stringifyTokens, interpolateText } from './interpolate'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
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
              tokens,
          )
      })

      it(input + ' mapExpression()', function () {
        assert.deepStrictEqual(
            tokenizeExpressions(input, (expression) => ({ expression }) ),
            tokens,
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
          stringifyTokens(tokens, (token) => `{{${ token.expression }}}` ),
          input,
        )
    })
  }
  
  expression_tokens.forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

describe('interpolateText', function () {

  function _runTestCase (input, tokens) {
      it( tokens.map(_toExpresion).join(''), function () {
          assert.strictEqual(
            interpolateText(input, (expression) => ({ expression }))( (token) => `{{${ token.expression }}}` ),
            input, 'direct',
          )
      })
  }
  
  expression_tokens.forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

/** */
})
/** */
