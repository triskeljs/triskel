

import assert from 'assert'

import { filterProcessor, parseExpressionFilters, splitPipes, expressionFilterProcessor } from './filters'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('filterProcessor', function () {

  it('throws', function () {
    assert.throws( () => filterProcessor(), Error )
    assert.throws( () => filterProcessor(), /missing filter_definitions/ )
  })

  it('currying', function () {
    assert.strictEqual( typeof filterProcessor({}), 'function' )
  })

  var filter_definitions = {
    uppercase: (text) => text.toUpperCase(),
    replaceFoo: (text, data) => text.replace(/foo/g, data),
    dropEven: (list) => list.filter( (num) => num%2 )
  }

  function _runTestCase (input, filter_name, data, result) {
    it(`'${ input }' | ${ filter_name }`, function () {
      assert.deepStrictEqual(
        filterProcessor(filter_definitions)(filter_name, input, data),
        result
      )
    })
  }
  
  [

    [` foo `, 'uppercase', null, ` FOO `],
    [` foo `, 'replaceFoo', `bar`, ' bar '],

    [ [1,2,3,4,5,6], 'dropEven', null, [1,3,5] ],

  ].forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

describe('splitPipes', function () {

  function _runTestCase (input, result) {
    it(`'${ input }'`, function () {
      assert.deepStrictEqual(
        splitPipes(input),
        result
      )
    })
  }
  
  [

    [` foo | bar `, [' foo ', ' bar '] ],
    [` foo || bar `, [' foo || bar '] ],
    [` foo || bar | foobar `, [' foo || bar ', ' foobar '] ],

  ].forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

describe('parseExpressionFilters', function () {

  function _runTestCase (input, result) {
    it(`'${ input }'`, function () {
      assert.deepStrictEqual(
        parseExpressionFilters(input),
        result
      )
    })
  }
  
  [

    [` foo | bar `, {
      expression: ' foo ',
      filters: [{ name: 'bar' }],
    } ],

    [` foobar | foo:{ user: name } | bar `, {
      expression: ' foobar ',
      filters: [{ name: 'foo', expression: '{ user: name }' }, { name: 'bar' }]
    }],

    [` foobar | foo:{ user: name } | bar: { last: name } `, {
      expression: ' foobar ',
      filters: [{ name: 'foo', expression: '{ user: name }' }, { name: 'bar', expression: '{ last: name }' }],
    } ],

  ].forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

describe('expressionFilterProcessor', function () {

  it('throws', function () {
    assert.throws( () => expressionFilterProcessor(), Error )
    assert.throws( () => expressionFilterProcessor(), /processFilter should be a Function/ )
    assert.throws( () => expressionFilterProcessor('foobar'), /processFilter should be a Function/ )
  })

  it('currying', function () {
    assert.strictEqual( typeof expressionFilterProcessor(function () {}), 'function' )
  })

  function _runTestCase (input, processFilter, result) {
    it(`'${ input }'`, function () {
      var _parsed = expressionFilterProcessor(processFilter)(input)

      assert.deepStrictEqual(
        _parsed.processFilters(_parsed.expression),
        result
      )
    })
  }

  function _filterToString (filter, result) {
    return `${ result.trim() } [${ filter.name.trim() }]${ filter.expression ? ('{{ ' + filter.expression.trim() + ' }}') : '' }`
  }
  
  [

    [`foo | bar `, _filterToString, 'foo [bar]' ],
    [`foo | bar:{ user: name } `, _filterToString, 'foo [bar]{{ { user: name } }}' ],

  ].forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

/** */
})
/** */
