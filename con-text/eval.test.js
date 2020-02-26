

import assert from 'assert'

import {
  removeStrings,
  matchVars,
  parseExpression,
  _getKeyFromData,
  evalExpression,
} from './eval'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('removeStrings', function () {

  function _runTestCase (input, result) {
    it(input, function () {
      assert.strictEqual(
        removeStrings(input),
        result,
      )
    })
  }
  
  [

    [` foo 'bar' `, ` foo '' `],
    [` foo "bar" `, ` foo "" `],
    [` foo 'b\\'ar' `, ` foo '' `],
    [` foo "b\\"ar" `, ` foo "" `],
    [` foo 'b\\'ar' 'b\\'ar' `, ` foo '' '' `],
    [` foo "b\\"ar" "b\\"ar" `, ` foo "" "" `],

  ].forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

var specs_expressions = [

  [` foo = 'bar' `, `foo`],
  [` foo.bar = 'foobar' `, `foo`],
  [` foo ? foo : bar `, `foo, bar`],
  [` foo ? (foobar + 'bar') : bar `, `foo, foobar, bar`],
  [` foo ? { bar: foobar } : null `, `foo, bar, foobar`],
  [` foo ? { bar: null } : null `, `foo, bar`],
  [` foo ? foo.bar : 'bar' `, `foo`],
  [` foo ? bar : null `, 'foo, bar'],
  [` foo?bar:null `, 'foo, bar'],
  [` $foo ? _$bar : null `, '$foo, _$bar'],

]

describe('matchVars', function () {

  function _runTestCase (expression, var_names) {
    it(`${ expression } => [${ var_names }]`, function () {
      assert.strictEqual(
        matchVars(expression).join(', '),
        var_names,
      )
    })
  }
  
  specs_expressions.forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

describe('parseExpression', function () {

    function _runTestCase (expression, var_names) {
      it(`${ expression } => [${ var_names }]`, function () {
        assert.deepStrictEqual(
          parseExpression(expression),
          { expression, var_names: var_names.split(', ') },
        )
      })
    }
    
    specs_expressions.forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

describe('eval errors', function () {

  it('throws Error', function () {

    assert.throws(function() { parseExpression(15) }, Error, null, 'Number')
    assert.throws(function() { parseExpression([]) }, Error, null, 'Array')
    assert.throws(function() { parseExpression(null) }, Error, null, 'null')

    assert.throws(function() { evalExpression(15) }, Error, null, 'Number')
    assert.throws(function() { evalExpression([]) }, Error, null, 'Array')
    assert.throws(function() { evalExpression(null) }, Error, null, 'null')

  })

  it('throws TypeError', function () {

    assert.throws(function() { parseExpression(15) }, TypeError, null, 'Number')
    assert.throws(function() { parseExpression([]) }, TypeError, null, 'Array')
    assert.throws(function() { parseExpression(null) }, TypeError, null, 'null')

    assert.throws(function() { evalExpression(15) }, TypeError, null, 'Number')
    assert.throws(function() { evalExpression([]) }, TypeError, null, 'Array')
    assert.throws(function() { evalExpression(null) }, TypeError, null, 'null')

  })

  it('err.message', function () {

    assert.throws(function() { parseExpression(15) }, /expression should be a String/, null, 'Number')
    assert.throws(function() { parseExpression([]) }, /expression should be a String/, null, 'Array')
    assert.throws(function() { parseExpression(null) }, /expression should be a String/, null, 'null')

    assert.throws(function() { evalExpression(15) }, /expression should be a String/, null, 'Number')
    assert.throws(function() { evalExpression([]) }, /expression should be a String/, null, 'Array')
    assert.throws(function() { evalExpression(null) }, /expression should be a String/, null, 'null')

  })

})

_getKeyFromData

describe('_getKeyFromData', function () {

  function _runTestCase (data, key, result) {
    it(`${ data }[${ key }] => ${ JSON.stringify(result, null, '') }`, function () {
      assert.deepStrictEqual(
        _getKeyFromData(data)(key),
        result,
      )
    })
  }
  
  [

    [ { foo: 'bar' }, 'foo', 'bar' ],
    [ [{ foo: 'bar' }], 'foo', 'bar' ],
    [ [{ foobar: 'bar' }], 'foo', undefined ],
    [ [{ foobar: 'bar' }, { barfoo: 'foo' }], 'foo', undefined ],
    [ [{ foobar: 'bar' }, { foo: 'foo' }], 'foo', 'foo' ],

  ].forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

describe('evalExpression', function () {

  function _runTestCase (expression, data, result) {
    it(`${ expression } => ${ JSON.stringify(result, null, '') }`, function () {
      assert.deepStrictEqual(
        evalExpression(expression, data),
        result,
      )
    })
  }
  
  [

    [` foo `, { foo: 'bar' }, 'bar'],
    [` foo.substr(1) `, { foo: 'bar' }, 'ar'],
    [` foo && bar `, { foo: true, bar: 'bar' }, 'bar'],
    [` foo && bar `, { foo: false, bar: 'bar' }, false],
    [` foo ? bar : null `, { foo: true, bar: 'bar' }, 'bar'],
    [` foo ? bar : null `, { foo: false, bar: 'bar' }, null],

  ].forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

/** */
})
/** */
