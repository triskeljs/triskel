
import assert from 'assert'
import sinon from 'sinon'
import { runErrorsTestSuite } from '../_common/test.helpers'

import {
  createConText,
  ConText,
} from './con-text'

describe('createConText', () => {
  const errors = [Error, TypeError, /target should be an \(non-null\) Object or a Function/]

  test
    .each([
      null,
      123,
    ])(
      '%s',
      (value) => {
        errors.forEach(error => {
          expect(() => createConText(value)).toThrow(error)
        })
      }
    )

  test('target', () => {
    const target = {}

    expect(createConText(target)).toBe(target)
  })

  test('no target', () => {
    expect(typeof createConText()).toBe('object')
  })
})

describe('ConText', () => {
  test
    .each([
      [null, [Error, /can not use target with constructor/]],
      [123, [Error, /can not use target with constructor/]],
    ])(
      '%s',
      (value, errors) => {
        errors.forEach(error => {
          expect(() => new ConText(value)).toThrow(error)
        })
      },
    )

  test
    .each([
      [[], [Error, TypeError, /target missing when not using constructor/]],
      [[123], [Error, TypeError, /target should be an \(non-null\) Object or a Function/]],
      [[null], [Error, TypeError, /target should be an \(non-null\) Object or a Function/]],
    ])(
      '%s',
      (args, errors) => {
        errors.forEach(error => {
          expect(() => ConText.apply(null, args)).toThrow(error)
        })
      },
    )

  test('new', () => {
    expect(new ConText()).toBeInstanceOf(ConText)
  })

  test('target', () => {
    const target = {}

    expect(ConText(target)).toBe(target)
  })
})

describe('TEXT.parseExpression', () => {
  test
    .each([
      ['foo', { expression: 'foo', has_filters: 0 }],
      ['foo | bar', { expression: 'foo ', has_filters: 1 }],
      ['foo | bar | foobar', { expression: 'foo ', has_filters: 2 }],
    ])(
      '%s, %j',
      (expression, expected_result) => {
        const result = new ConText().parseExpression(expression)

        expect(result.expression).toBe(expected_result.expression)
        expect(result.filters.length).toBe(expected_result.has_filters)
      }
    )
})

describe('TEXT.parseExpression::processFilters()', () => {
  test('throws', () => {
    [Error, /filter 'bar' is not defined/]
      .forEach(error => {
        expect(() => {
          new ConText().parseExpression(' foo | bar ').processFilters()
        })
          .toThrow(error)
      })
  })

  test
    .each([
      ['foo', 123, 123],
      ['foo | bar', 123, 'bar:123', { bar: (input) => 'bar:' + input }],

      ['foobar | bar | foo', 123, 'foo:bar:123', { foo: (input) => 'foo:' + input, bar: (input) => 'bar:' + input }],
      ['foobar | foo | bar', 123, '123:foo:bar', { foo: (input) => input + ':foo', bar: (input) => input + ':bar' }],
    ])(
      '%s, %j',
      (expression, data, expected_result, filter_definitions = null) => {
        const TEXT = new ConText()

        if (filter_definitions) TEXT.defineFilter(filter_definitions)

        expect(
          TEXT.parseExpression(expression).processFilters(data)
        ).toBe(expected_result)
      }
    )
})

describe('TEXT.parseExpression::processFilters(spy)', () => {
  test
    .each([
      ['bar | foobar: { foo }', { foo: 'bar' }],
      ['bar | foobar: { foo }', { foo: 'bar' }, { foobar: { foo: 'bar' } }],
      ['bar | foobar: { foo } | 123: { num }', { foo: 'bar', num: 123 }, { foobar: { foo: 'bar' }, 123: { num: 123 } }],
    ])(
      '%s, %j',
      (expression, data, filter_data = {}) => {
        const TEXT = new ConText()
        const parsed = TEXT.parseExpression(expression)
        const filter_definitions = parsed.filters
          .reduce(function (definitions, filter) {
            definitions[filter.name] = jest.fn(input => input)
            return definitions
          }, {})

        TEXT.defineFilter(filter_definitions)

        parsed.processFilters(data, data)

        for (const key in filter_definitions) {
          // expect(filter_definitions[key].mock.calls.length).toBe(1)
          expect(filter_definitions[key]).toHaveBeenCalledTimes(1)
          expect(filter_definitions[key].mock.calls[0][0]).toStrictEqual(data)
          expect(filter_definitions[key].mock.calls[0][1]).toStrictEqual(filter_data[key] || data)
        }
      }
    )
})

const eval_test_suites = {

  eval: [

    ['foo', { foo: 'bar' }, 'bar'],
    ['foo | bar', { foo: 'bar' }, 'bar:bar', { bar: input => input + ':bar' }],
    ['foo | bar: { key: bar }', { foo: 'bar', bar: 123 }, 'bar:123', { bar: (input, data) => input + ':' + data.key }],

  ],

  interpolate: [

    ['{{ foo }}', { foo: 'bar' }, 'bar'],
    ['[{{ foo | bar }}]', { foo: 'bar' }, '[bar:bar]', { bar: input => input + ':bar' }],
    ['::[{{ foo | bar: { key: bar } }}]', { foo: 'bar', bar: 123 }, '::[bar:123]', { bar: (input, data) => input + ':' + data.key }],

  ],

}

Object
  .keys(eval_test_suites)
  .forEach(method => {
    describe('TEXT.' + method, () => {
      test
        .each([
          Error,
          /expression should be a String/,
        ])(
          '%s',
          error => {
            expect(() => new ConText()[method](null)).toThrow(error)
          }
        )

      test
        .each(eval_test_suites[method])(
          '%s',
          (expression, data, expected_result, filter_definitions = {}) => {
            const TEXT = new ConText().defineFilter(filter_definitions)

            expect(TEXT[method](expression, data)).toBe(expected_result)
          },
        )

      test
        .each(eval_test_suites[method])(
          '%s  (curring)',
          (expression, data, expected_result, filter_definitions = {}) => {
            const TEXT = new ConText().defineFilter(filter_definitions)

            expect(TEXT[method](expression)(data)).toBe(expected_result)
          },
        )
    })
  })

// /** define-property */
// describe(__filename.substr(process.cwd().length), function () {
//   // --------------------------------------

//   const eval_test_suites = {

//     eval: [

//       ['foo', { foo: 'bar' }, 'bar'],
//       ['foo | bar', { foo: 'bar' }, 'bar:bar', { bar: (input) => input + ':bar' }],
//       ['foo | bar: { key: bar }', { foo: 'bar', bar: 123 }, 'bar:123', { bar: (input, data) => input + ':' + data.key }],

//     ],

//     interpolate: [

//       ['{{ foo }}', { foo: 'bar' }, 'bar'],
//       ['[{{ foo | bar }}]', { foo: 'bar' }, '[bar:bar]', { bar: (input) => input + ':bar' }],
//       ['::[{{ foo | bar: { key: bar } }}]', { foo: 'bar', bar: 123 }, '::[bar:123]', { bar: (input, data) => input + ':' + data.key }],

//     ],

//   }

//   Object
//     .keys(eval_test_suites)
//     .forEach(function (method) {
//       describe('TEXT.' + method, function () {
//         runErrorsTestSuite([

//           [() => {
//             new ConText()[method](null)
//           }, Error, /expression should be a String/],
    
//         ])

//         function _runTestCase (expression, data, expected_result, filter_definitions) {
//           it(`${expression}, ${JSON.stringify(expected_result)}`, () => {
//             const TEXT = new ConText()
//               .defineFilter(filter_definitions || {})
    
//             assert.deepStrictEqual(
//               TEXT[method](expression, data),
//               expected_result,
//             )
//           })
    
//           it(`${expression} (curring), ${JSON.stringify(expected_result)}`, () => {
//             const TEXT = new ConText()
//               .defineFilter(filter_definitions || {})
    
//             assert.deepStrictEqual(
//               TEXT[method](expression)(data),
//               expected_result,
//             )
//           })
//         }

//         eval_test_suites[method].forEach((test_case) => _runTestCase.apply(null, test_case))
//       })
//     })
// })
