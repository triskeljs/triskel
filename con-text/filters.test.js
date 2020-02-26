

import assert from 'assert'
import { runErrorCase } from '../_common/test.helpers'

import {
  defineFilter,
  _processFilter,
  filterProcessor,
  parseExpressionFilters,
  splitPipes,
} from './filters'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('defineFilter', function () {

  [
    [() => defineFilter(), TypeError, /filter_definitions should be an Object/],
    [() => defineFilter({}), TypeError, /filter_name should be a String/],
    [() => defineFilter({}, null), TypeError, /filter_name should be a String/],
    [() => defineFilter({}, 'foobar'), TypeError, /filterProcessor should be a Function/],

  ].forEach( (test_case) => runErrorCase.apply(null, test_case) )

  it ('should add filter', () => {
    const filter_definitions = {}

    function filterFn () {}
    
    defineFilter(filter_definitions, 'foo', filterFn)

    assert.strictEqual( filter_definitions.foo, filterFn )

  })

})


describe('filterProcessor', function () {

  [

    [() => _processFilter(), Error, /missing filter_name/],
    [() => _processFilter.call({}, 'foobar'), Error, /filter 'foobar' is not defined/],

  ].forEach( (test_case) => runErrorCase.apply(null, test_case) )

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
    dropEven: (list) => list.filter( (num) => num%2 ),
  }

  function _runTestCase (input, filter_name, data, result) {
    it(`'${ input }' | ${ filter_name }`, function () {
      assert.deepStrictEqual(
        filterProcessor(filter_definitions)(filter_name, input, data),
        result,
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
        result,
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
        result,
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
      filters: [{ name: 'foo', expression: '{ user: name }' }, { name: 'bar' }],
    }],

    [` foobar | foo:{ user: name } | bar: { last: name } `, {
      expression: ' foobar ',
      filters: [{ name: 'foo', expression: '{ user: name }' }, { name: 'bar', expression: '{ last: name }' }],
    } ],

  ].forEach( (test_case) => _runTestCase.apply(null, test_case) )

})

/** */
})
/** */
