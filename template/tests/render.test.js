
import assert from 'assert'
import renderTokens from '../render'
import { ConText } from '@triskel/con-text'
import preset_statements from '../preset-statements'

var con_Text = new ConText()

describe('tokens render', function () {

  it('1 level', function () {

    assert.strictEqual(renderTokens(con_Text, [
      'foo ',
      { $$: 'foobar' },
      ' bar',
    ], { foobar: 'gogogo' }), 'foo gogogo bar')

  })

  it('2nd level', function () {

    assert.strictEqual(renderTokens(con_Text, [
      'foo ',
      { $: 'if', $$: 'foobar', _: 'gogogo' },
      ' bar',
    ], { foobar: true }, preset_statements), 'foo gogogo bar')

    assert.strictEqual(renderTokens(con_Text, [
      'foo ',
      { $: 'if', $$: 'foobar', _: 'gogogo' },
      ' bar',
    ], { foobar: false }, preset_statements), 'foo  bar')

  })

  it('preset each Array', function () {

    assert.strictEqual(renderTokens(con_Text, [
      'foo ',
      {
        $: 'each', $$: ' foo in foobar ', _: [
          { $$: ' $index ' }, ': ',
          { $$: ' foo ' },
          ', ',
        ],
      },
      ' bar',
    ], {
      foobar: [
        'crash',
        'test',
        'dummy',
      ],
    }, preset_statements), 'foo 0: crash, 1: test, 2: dummy,  bar', 'String list')

    assert.strictEqual(renderTokens(con_Text, [
      'foo ',
      {
        $: 'each', $$: ' foo in foobar ', _: [
          { $$: ' $index ' }, ': ',
          { $$: ' foo.foo ' },
          ', ',
        ],
      },
      ' bar',
    ], {
      foobar: [
        { foo: 'crash' },
        { foo: 'test' },
        { foo: 'dummy' },
      ],
    }, preset_statements), 'foo 0: crash, 1: test, 2: dummy,  bar', 'Objects list')

    assert.strictEqual(renderTokens(con_Text, [
      'foo ',
      {
        $: 'each', $$: ' foo in foobar ', _: [
          { $: 'if', $$: ' $index ', _: ', ', __: '' },
          { $$: ' $index ' }, ': ',
          { $$: ' foo ' },
        ],
      },
      ' bar',
    ], {
      foobar: [
        'crash',
        'test',
        'dummy',
      ],
    }, preset_statements), 'foo 0: crash, 1: test, 2: dummy bar', 'String list better commas')

  })

  it('preset each Object (map)', function () {

    assert.strictEqual(renderTokens(con_Text, [
      'foo ',
      {
        $: 'each', $$: ' foo in foobar ', _: [
          { $$: '$key' }, ': ',
          { $$: ' foo ' },
          ', ',
        ],
      },
      ' bar',
    ], {
      foobar: {
        foo: 'crash',
        bar: 'test',
        foobar: 'dummy',
      },
    }, preset_statements), 'foo foo: crash, bar: test, foobar: dummy,  bar')

  })

})
