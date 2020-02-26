
import parseTemplate from '../parser'
import assert from 'assert'

var specs = {
  'simple expresion': {
    src: 'foo ${ foobar } bar',
    deep_expect: [
      'foo ',
      { $$: ' foobar ' },
      ' bar',
    ],
  },
  'if expresion': {
    src: 'foo $if{ foobar } bar {/}',
    deep_expect: [
      'foo ',
      { $: 'if', $$: ' foobar ', _: ' bar ' },
    ],
  },
  'if else expresion': {
    src: 'foo $if{ foobar } foo {:} bar {/}',
    deep_expect: [
      'foo ',
      { $: 'if', $$: ' foobar ', _: ' foo ', __: ' bar ' },
    ],
  },
  'if expresion list content': {
    src: 'foo $if{ foobar } ${ foo } bar {/}',
    deep_expect: [
      'foo ',
      { $: 'if', $$: ' foobar ', _: [
        ' ',
        { $$: ' foo ' },
        ' bar ',
      ] },
    ],
  },
  'if else expresion list content': {
    src: 'foo $if{ foobar } ${ foo } {:} ${ bar } {/}',
    deep_expect: [
      'foo ',
      { $: 'if', $$: ' foobar ', _: [
        ' ',
        { $$: ' foo ' },
        ' ',
      ], __: [
        ' ',
        { $$: ' bar ' },
        ' ',
      ] },
    ],
  },
  'statement $foo{}': {
    src: '$foo{ bar }',
    deep_expect: [
      { $: 'foo', $$: ' bar ' },
    ],
    self_closed_statements: {
      foo: true,
    },
  },
  'statement $foo{}{/}': {
    src: '$foo{ bar }{/}',
    deep_expect: [
      { $: 'foo', $$: ' bar ' },
    ],
  },
}

describe('parsing', function () {

  Object.keys(specs).forEach(function (spec_name) {
    var spec = specs[spec_name]

    it( spec_name, function () {

      var result = parseTemplate(spec.src, spec.self_closed_statements)

      assert.deepEqual( result, spec.deep_expect, spec.src )
    })

  })

})

describe('throws: Unexpected close token', function () {

  it('lonely close', function () {

    assert.throws(function () {

      parseTemplate(' {/} ')

    }, /Unexpected close token/)

  })

  it('closing twice', function () {

    assert.throws(function () {

      parseTemplate(' $if{ foo } bar {/} {/} ')

    }, /Unexpected close token/)

  })

  it('closing 3 times', function () {

    assert.throws(function () {

      parseTemplate(' $if{ foo } bar {/} {/} {/} ')

    }, /Unexpected close token/)

  })

})

describe('throws: Unexpected close token {/}', function () {

  it('lonely close', function () {

    assert.throws(function () {

      parseTemplate(' {/} ')

    }, /Unexpected close token {\/}/)

  })

  it('closing twice', function () {

    assert.throws(function () {

      parseTemplate(' $if{ foo } bar {/} {/} ')

    }, /Unexpected close token {\/}/)

  })

  it('closing 3 times', function () {

    assert.throws(function () {

      parseTemplate(' $if{ foo } bar {/} {/} {/} ')

    }, /Unexpected close token {\/}/)

  })

})

describe('throws: Unexpected close token {/foo}', function () {

  it('lonely close', function () {

    assert.throws(function () {

      parseTemplate(' {/foo} ')

    }, /Unexpected close token {\/foo}/)

  })

  it('closing twice', function () {

    assert.throws(function () {

      parseTemplate(' $if{ foo } bar {/if} {/foo} ')

    }, /Unexpected close token {\/foo}/)

  })

  it('closing 3 times', function () {

    assert.throws(function () {

      parseTemplate(' $if{ foo } bar {/if} {/foo} {/bar} ')

    }, /Unexpected close token {\/foo}/)

  })

})
