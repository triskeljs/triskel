
import assert from 'assert'
import template from '../template'

import { runErrorsTestSuite } from '../../_common/test.helpers'

describe('template (parsing/rendering)', function () {

  runErrorsTestSuite([
    [() => template(null), Error, TypeError, /template source should be a String/],
    [() => template(123), Error, TypeError, /template source should be a String/],
    [() => template([]), Error, TypeError, /template source should be a String/],
  ])

  runErrorsTestSuite([
    [() => template.defineFilter(null), Error, TypeError, /filter name should be a String/],
    [() => template.defineFilter(123), Error, TypeError, /filter name should be a String/],
    [() => template.defineFilter([]), Error, TypeError, /filter name should be a String/],
    [() => template.defineFilter('foo', 123), Error, TypeError, /filter function should be a Function/],
    [() => template.defineFilter('foo', []), Error, TypeError, /filter function should be a Function/],
  ])

  it('1 level', function () {

    assert.strictEqual( template('foo ${ foobar } bar', { foobar: 'gogogo' }) , 'foo gogogo bar' )

  })

  it('2nd level', function () {

    assert.strictEqual( template('foo $if{ foobar }gogogo{/} bar', { foobar: true }) , 'foo gogogo bar' )

    assert.strictEqual( template('foo $if{ foobar }gogogo{/} bar', { foobar: false }) , 'foo  bar' )

  })

  it('preset each Array', function () {

    assert.strictEqual( template('foo $each{ foo in foobar }${ $index }: ${ foo }, {/} bar', {
      foobar: [
        'crash',
        'test',
        'dummy',
      ],
    }) , 'foo 0: crash, 1: test, 2: dummy,  bar', 'String list' )

    assert.strictEqual( template('foo $each{ foo in foobar }${ $index }: ${ foo.foo }, {/} bar', {
      foobar: [
        { foo: 'crash' },
        { foo: 'test' },
        { foo: 'dummy' },
      ],
    }) , 'foo 0: crash, 1: test, 2: dummy,  bar', 'Objects list' )

    assert.strictEqual( template('foo $each{ foo in foobar }$if{ $index }, {/}${ $index }: ${ foo }{/} bar', {
      foobar: [
        'crash',
        'test',
        'dummy',
      ],
    }) , 'foo 0: crash, 1: test, 2: dummy bar', 'String list better commas' )

  })

  it('preset each Object (map)', function () {

    assert.strictEqual( template('foo $each{ foo in foobar }${ $key }: ${ foo }, {/} bar', {
      foobar: {
        foo: 'crash',
        bar: 'test',
        foobar: 'dummy',
      },
    }) , 'foo foo: crash, bar: test, foobar: dummy,  bar' )

  })

  const filters = {
    lowercase: (input) => input.toLowerCase(),
    uppercase: (input) => input.toUpperCase(),
  }

  function _runFilterTestCase (text, data, expected_result) {

    it(`'${ text }' + ${ JSON.stringify(data) } = '${ expected_result }'`, function () {

      const t = template.context()
    
      for ( var filter_name in filters ) {
        t.filter(filter_name, filters[filter_name])
      }

      t.put('foo', text)

      assert.strictEqual(
        t.get('foo')(data),
        expected_result,
      )

      assert.strictEqual(
        t(text, data),
        expected_result,
      )

      assert.strictEqual(
        t.render(text, data),
        expected_result,
      )

      assert.strictEqual(
        t.compile(text)(data),
        expected_result,
      )
        
    })

  }

  [

    ['Hi ${ first_name }!', { first_name: 'John' }, 'Hi John!'],
    ['Hi ${ first_name | lowercase }!', { first_name: 'John' }, 'Hi john!'],
    ['Hi ${ first_name | uppercase }!', { first_name: 'John' }, 'Hi JOHN!'],

  ].forEach( (test_case) => _runFilterTestCase.apply(null, test_case) )

})
