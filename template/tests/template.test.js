
import assert from 'assert'
import template from '../template'

describe('template (parsing/rendering)', function () {

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

})
