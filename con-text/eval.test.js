

import assert from 'assert'
import { runErrorsTestSuite } from '../_common/test.helpers'

import {
  removeStrings,
  matchVars,
  parseExpression,
  propGetter,
  evalExpression,
} from './eval'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
  // --------------------------------------

  describe('removeStrings', function () {

    function _runTestCase(input, result) {
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

    ].forEach((test_case) => _runTestCase.apply(null, test_case))

  })

  var specs_expressions = [

    [` () `, ``],
    [` foo = 'bar' `, `foo`],
    [` foo = "bar" `, `foo`],
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

    runErrorsTestSuite([

      [() => matchVars(), Error, /expression should be a String/],
      [() => matchVars(null), Error, /expression should be a String/],

    ])

    function _runTestCase(expression, var_names) {
      it(`${expression} => [${var_names}]`, function () {
        assert.strictEqual(
          matchVars(expression).join(', '),
          var_names,
        )
      })
    }

    specs_expressions.forEach((test_case) => _runTestCase.apply(null, test_case))

  })

  describe('parseExpression', function () {

    runErrorsTestSuite([

      [() => parseExpression(), Error, /expression should be a String/],
      [() => parseExpression(null), Error, /expression should be a String/],

    ])

    function _runTestCase(expression, var_names) {
      it(`${expression} => [${var_names}]`, function () {
        assert.deepStrictEqual(
          parseExpression(expression),
          { expression, var_names: var_names ? var_names.split(', ') : [] },
        )
      })
    }

    specs_expressions.forEach((test_case) => _runTestCase.apply(null, test_case))

  })

  describe('eval errors', function () {

    runErrorsTestSuite([

      [ () => parseExpression(15), Error, TypeError, /expression should be a String/ ],
      [ () => parseExpression([]), Error, TypeError, /expression should be a String/ ],
      [ () => parseExpression([15]), Error, TypeError, /expression should be a String/ ],
      [ () => parseExpression(null), Error, TypeError, /expression should be a String/ ],

    ])

  })

  describe('propGetter', function () {

    function _runTestCase(data, key, result) {
      it(`${data}[${key}] => ${JSON.stringify(result, null, '')}`, function () {
        assert.deepStrictEqual(
          propGetter(data)(key),
          result,
        )
      })
    }

    [

      [{ foo: 'bar' }, 'foo', 'bar'],
      [null, 'foo', undefined],
      [[], 'foo', undefined],
      [[{ foo: 'bar' }], 'foo', 'bar'],
      [[{ foobar: 'bar' }], 'foo', undefined],
      [[{ foobar: 'bar' }, { barfoo: 'foo' }], 'foo', undefined],
      [[{ foobar: 'bar' }, { foo: 'foo' }], 'foo', 'foo'],

      // fallback to global
      [{ foo: 'bar' }, 'Promise', Promise],

    ].forEach((test_case) => _runTestCase.apply(null, test_case))

    it(`(no data) => global getter`, function () {
      assert.deepStrictEqual(
        propGetter(null)('Promise'),
        Promise,
      )
    })

    it(`(no data, no global) => global getter`, function () {
      assert.deepStrictEqual(
        propGetter(null, null)('Promise'),
        undefined,
      )
      assert.deepStrictEqual(
        propGetter([], null)('Promise'),
        undefined,
      )
    })

  })

  describe('evalExpression', function () {

    runErrorsTestSuite([

      [() => evalExpression(), Error, /expression should be a String/],
      [() => evalExpression(null), Error, /expression should be a String/],

    ])

    it('curring', function () {

      assert.strictEqual(typeof evalExpression('foobar'), 'function')

    })

    function _runTestCase(expression, data, result) {
      it(`${expression} => ${JSON.stringify(result, null, '')}`, function () {
        assert.deepStrictEqual(
          evalExpression(expression, data),
          result,
        )
      })

      it(`${expression} (curring) => ${JSON.stringify(result, null, '')}`, function () {
        assert.deepStrictEqual(
          evalExpression(expression)(data),
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

    ].forEach((test_case) => _runTestCase.apply(null, test_case))

  })

  /** */
})
/** */
