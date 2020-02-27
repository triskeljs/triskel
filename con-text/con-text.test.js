
import assert from 'assert'
import sinon from 'sinon'
import { runErrorsTestSuite } from '../_common/test.helpers'

import {
  createConText,
  ConText,
} from './con-text'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
  // --------------------------------------

  describe('createConText', function () {

    runErrorsTestSuite([

      [() => createConText(null), Error, TypeError, /target should be an \(non-null\) Object or a Function/],
      [() => createConText(123), Error, TypeError, /target should be an \(non-null\) Object or a Function/],

    ])

    it('target', function () {

      const target = {}

      assert.strictEqual(createConText(target), target)

    })

    it('no target', function () {

      assert.strictEqual(typeof createConText(), 'object')

    })

  })

  describe('ConText', function () {

    runErrorsTestSuite([

      [() => new ConText(null), Error, /can not use target with constructor/],
      [() => new ConText(123), Error, /can not use target with constructor/],

      [() => ConText(), Error, TypeError, /target missing when not using constructor/],
      [() => ConText(123), Error, TypeError, /target should be an \(non-null\) Object or a Function/],
      [() => ConText(null), Error, TypeError, /target should be an \(non-null\) Object or a Function/],

    ])

    it('new', function () {

      assert(new ConText() instanceof ConText)

    })

    it('target', function () {

      const target = {}

      assert.strictEqual(ConText(target), target)

    })

  })


  describe('TEXT.parseExpression', function () {

    function _runTestCase(expression, expected_result) {

      it(`${expression}, ${JSON.stringify(expected_result)}`, () => {

        const result = new ConText().parseExpression(expression)

        assert.strictEqual(result.expression, expected_result.expression, 'expression')
        assert.strictEqual(result.filters.length, expected_result.has_filters, 'has_filters')

      })

    }

    [

      ['foo', { expression: 'foo', has_filters: 0 }],
      ['foo | bar', { expression: 'foo ', has_filters: 1 }],
      ['foo | bar | foobar', { expression: 'foo ', has_filters: 2 }],

    ].forEach((test_case) => _runTestCase.apply(null, test_case))

  })

  describe('TEXT.parseExpression::processFilters()', function () {

    runErrorsTestSuite([
      [() => {
        new ConText().parseExpression(' foo | bar ').processFilters()
      }, Error, /filter 'bar' is not defined/],

    ])


    function _runTestCase(expression, data, expected_result, filter_definitions) {

      it(`${expression}, ${JSON.stringify(expected_result)}`, () => {

        const TEXT = new ConText()

        if (filter_definitions) TEXT.defineFilter(filter_definitions)

        assert.deepStrictEqual(
          TEXT.parseExpression(expression).processFilters(data),
          expected_result,
        )

      })

    }

    [

      ['foo', 123, 123],
      ['foo | bar', 123, 'bar:123', { bar: (input) => 'bar:' + input }],

      ['foobar | bar | foo', 123, 'foo:bar:123', { foo: (input) => 'foo:' + input, bar: (input) => 'bar:' + input }],
      ['foobar | foo | bar', 123, '123:foo:bar', { foo: (input) => input + ':foo', bar: (input) => input + ':bar' }],

    ].forEach((test_case) => _runTestCase.apply(null, test_case))

  })

  describe('TEXT.parseExpression::processFilters(spy)', function () {

    function _runTestCase(expression, data, filter_data = {}) {

      it(`${expression}, ${JSON.stringify(data)}`, () => {

        const TEXT = new ConText()
        const parsed = TEXT.parseExpression(expression)
        const filter_definitions = parsed.filters
          .reduce(function (definitions, filter) {
            definitions[filter.name] = sinon.fake( (input) => input )
            return definitions
          }, {})

        TEXT.defineFilter(filter_definitions)

        parsed.processFilters(data, data)

        for (let key in filter_definitions) {
          assert.strictEqual( filter_definitions[key].callCount, 1, 'callCount')
          assert.deepStrictEqual( filter_definitions[key].getCall(0).args[0], data, 'data')
          assert.deepStrictEqual( filter_definitions[key].getCall(0).args[1], filter_data[key] || data, 'filter_data')
        }

      })

    }

    [

      ['bar | foobar: { foo }', { foo: 'bar' }],
      ['bar | foobar: { foo }', { foo: 'bar' }, { foobar: { foo: 'bar' } }],
      ['bar | foobar: { foo } | 123: { num }', { foo: 'bar', num: 123 }, { foobar: { foo: 'bar' }, '123': { num: 123 } }],

    ].forEach((test_case) => _runTestCase.apply(null, test_case))

  })

  const eval_test_suites = {

    eval: [

      ['foo', { foo: 'bar' }, 'bar'],
      ['foo | bar', { foo: 'bar' }, 'bar:bar', { bar: (input) => input + ':bar' }],
      ['foo | bar: { key: bar }', { foo: 'bar', bar: 123 }, 'bar:123', { bar: (input, data) => input + ':' + data.key }],

    ],

    interpolate: [

      ['{{ foo }}', { foo: 'bar' }, 'bar'],
      ['[{{ foo | bar }}]', { foo: 'bar' }, '[bar:bar]', { bar: (input) => input + ':bar' }],
      ['::[{{ foo | bar: { key: bar } }}]', { foo: 'bar', bar: 123 }, '::[bar:123]', { bar: (input, data) => input + ':' + data.key }],

    ],

  }

  Object
    .keys(eval_test_suites)
    .forEach(function (method) {

      describe('TEXT.' + method, function () {

        runErrorsTestSuite([

          [() => {
            new ConText()[method](null)
          }, Error, /expression should be a String/],
    
        ])

        function _runTestCase(expression, data, expected_result, filter_definitions) {

          it(`${expression}, ${JSON.stringify(expected_result)}`, () => {
    
            const TEXT = new ConText()
              .defineFilter(filter_definitions || {})
    
            assert.deepStrictEqual(
              TEXT[method](expression, data),
              expected_result,
            )
    
          })
    
          it(`${expression} (curring), ${JSON.stringify(expected_result)}`, () => {
    
            const TEXT = new ConText()
              .defineFilter(filter_definitions || {})
    
            assert.deepStrictEqual(
              TEXT[method](expression)(data),
              expected_result,
            )
    
          })
    
        }

        eval_test_suites[method].forEach((test_case) => _runTestCase.apply(null, test_case))

      })

    })

})
