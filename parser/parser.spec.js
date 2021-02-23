
import parseHTML from './parser'

test('throws', () => {
  expect(() => {
    parseHTML('<div id="foobar">')
  })
    .toThrow(Error)
})

test.each([
  [
    'div',
    `
<div id="foobar">foo</div>
    `,
    [{ tag: 'div', attrs: { id: 'foobar' }, content: ['foo'] }]
  ],

  [
    'attrs in lines',
    `
<div id="foobar"
     foo="bar">foo</div>
    `,
    [{ tag: 'div', attrs: { id: 'foobar', foo: 'bar' }, content: ['foo'] }]
  ],

  [
    'empty attrs',
    '<div id="foobar" foo-bar bar-foo foo bar>foo</div>',
    [
      {
        tag: 'div',
        attrs: { id: 'foobar', 'foo-bar': '', 'bar-foo': '', foo: '', bar: '' },
        content: ['foo']
      },
    ]
  ],

  [
    'mixed empty attrs',
    '<div id="foobar" foo-bar bar-foo="foo[bar]">foo</div>',
    [{ tag: 'div', attrs: { id: 'foobar', 'foo-bar': '', 'bar-foo': 'foo[bar]' }, content: ['foo'] }],
  ],

  [
    'several p',
    `
    <p>Lorem ipsum...</p><p>dolor sit...</p><p>amet...</p>
    `,
    [
      { tag: 'p', content: ['Lorem ipsum...'] },
      { tag: 'p', content: ['dolor sit...'] },
      { tag: 'p', content: ['amet...'] },
    ],
  ],

  [
    'lt in attributes',
    `
    <div data-if=" foo < bar ">foobar</div>
    `,
    [{ tag: 'div', attrs: { 'data-if': 'foo < bar' }, content: ['foobar'] }],
  ],

  [
    'gt in attributes',
    `
    <div data-if=" foo > bar ">foobar</div>
    `,
    [{ tag: 'div', attrs: { 'data-if': 'foo > bar' }, content: ['foobar'] }],
  ],

  [
    'lt && gt in attributes',
    `
<div data-if=" foo < bar && foo > bar ">foobar</div>
    `,
    [{ tag: 'div', attrs: { 'data-if': 'foo < bar && foo > bar' }, content: ['foobar'] }],
  ],

  [
    'several lt attributes',
    `
    <foo-bar foo=" bar < foo && bar < foo "></foo-bar>
    `,
    [{ tag: 'foo-bar', attrs: { foo: 'bar < foo && bar < foo' } }],
  ],

  [
    'several lt attributes (single quotes)',
    `
<foo-bar foo=' bar < foo && bar < foo '></foo-bar>
    `,
    [{ tag: 'foo-bar', attrs: { foo: 'bar < foo && bar < foo' } }]
  ],

  [
    'several gt attributes',
    `
    <foo-bar foo=" bar > foo && bar > foo "></foo-bar>
    `,
    [{ tag: 'foo-bar', attrs: { foo: 'bar > foo && bar > foo' } }],
  ],

  // [
  //   'several gt attributes (single quotes)',
  //   `
  //   <foo-bar foo=' bar > foo && bar > foo '></foo-bar>
  //   `,
  //   [{ tag: 'foo-bar', attrs: { foo: 'bar > foo && bar > foo' } }],
  // ],

  [
    'several lt && gt attributes',
    `
    <foo-bar foo=" bar > foo && bar < foo && bar < foo && bar > foo "></foo-bar>
    `,
    [{ tag: 'foo-bar', attrs: { foo: 'bar > foo && bar < foo && bar < foo && bar > foo' } }],
  ],

  [
    'several lines attributes',
    `
    <foo-bar
      foo="bar"
      bar="foo"></foo-bar>
    `,
    [{ tag: 'foo-bar', attrs: { foo: 'bar', bar: 'foo' } }],
  ],

  [
    'several lines attribute values',
    `
<foo-bar
  foo="bar"
  bar="{
    foo: 'bar',
    bar: 'foobar',
  }"></foo-bar>
    `,
    [{ tag: 'foo-bar', attrs: { foo: 'bar', bar: '{\n    foo: \'bar\',\n    bar: \'foobar\',\n  }' } }],
    { compress_attributes: false },
  ],

  [
    'several lines attribute values (single quotes)',
    `
    <foo-bar
      foo="bar"
      bar='{
        foo: "bar",
        bar: "foobar",
      }'></foo-bar>
    `,
    [{ tag: 'foo-bar', attrs: { foo: 'bar', bar: '{\n        foo: "bar",\n        bar: "foobar",\n      }' } }],
    { compress_attributes: false },
  ],

  [
    'several lines attribute values (compress_attributes)',
    `
    <foo-bar
      foo="bar"
      bar="{
        foo: 'bar',
        bar: 'foobar',
      }"></foo-bar>
    `,
    [{ tag: 'foo-bar', attrs: { foo: 'bar', bar: '{foo: \'bar\',bar: \'foobar\',}' } }],
    { compress_attributes: true },
  ],

  [
    'gt x2 in attributes',
    `
    <div data-if=" foo > bar || bar > foo ">foobar</div>
    `,
    [{ tag: 'div', attrs: { 'data-if': 'foo > bar || bar > foo' }, content: ['foobar'] }],
  ],

  [
    'script',
    `
<script template:type="text/javascript">
  var foo = 'bar';
</script>
    `,
    [{
      tag: 'script',
      attrs: { 'template:type': 'text/javascript' },
      content: [`
  var foo = 'bar';
`]
    }]
  ],

  [
    'simple comments',
    `
<!-- foo bar -->
    `,
    [{ comments: ' foo bar ' }],
  ],

  [
    'commented script',
    `
<!--<script template:type="text/javascript">
  var foo = 'bar';
</script>-->
    `,
    [{
      comments: `<script template:type="text/javascript">
  var foo = 'bar';
</script>`
    }],
  ],

  [
    'remove_comments',
    `
    <!--<script template:type="text/javascript">
      var foo = 'bar';
    </script>-->
    `,
    [],
    { remove_comments: true },
  ],

  [
    'remove_comments (2)',
    `
foo <!--<script template:type="text/javascript">
  var foo = 'bar';
</script>--> bar
    `,
    ['foo ', ' bar'],
    { remove_comments: true },
  ],

  [
    'code',
    `
    <pre><code class="language-html">
    <!DOCTYPE html>
    <html>
      <head></head>
      <body></body>
    <html>
    </code></pre>
    `,
    [{
      tag: 'pre',
      content: [{
        tag: 'code',
        attrs: { class: 'language-html' },
        content: [`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body></body>
    <html>
    `],
      }]
    }]
  ],

  //   [
  //     'code <script>',
  //     `
  // <pre><code class="language-html">
  // <!DOCTYPE html>
  // <html>
  //   <head></head>
  //   <body>
  //     <script></script>
  //   </body>
  // <html>
  // </code></pre>
  //     `,
  //     [{
  //       tag: 'pre',
  //       content: [{
  //         tag: 'code',
  //         attrs: { class: 'language-html' },
  //         content: [`
  // <!DOCTYPE html>
  // <html>
  //   <head></head>
  //   <body>
  //     <script></script>
  //   </body>
  // <html>
  // `],
  //       }]
  //     }],
  //   ],

])('%s', (_title, html, ast, options = {}) => {
  expect(parseHTML(html, options)).toStrictEqual(ast)
})
