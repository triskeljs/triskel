
var parseHTML = require('../parser'),
    assert = require('assert')

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('parser', function () {

  it('div', function () {

    assert.deepEqual( parseHTML(`
<div id="foobar">foo</div>
    `), [{ $:'div', attrs:{ id: 'foobar' }, _:'foo' }] )

  })

  it('attrs in lines', function () {

    assert.deepEqual( parseHTML(`
<div id="foobar"
     foo="bar">foo</div>
    `), [{ $:'div', attrs:{ id: 'foobar', foo: 'bar' }, _:'foo' }] )

  })

  it('empty attrs', function () {

    assert.deepEqual( parseHTML(`
<div id="foobar" foo-bar bar-foo foo bar>foo</div>
    `), [{ $:'div', attrs:{ id: 'foobar', 'foo-bar': '', 'bar-foo': '', foo: '', bar: '' }, _:'foo' }] )

  })

  it('mixed empty attrs', function () {

    assert.deepEqual( parseHTML(`
<div id="foobar" foo-bar bar-foo="foo[bar]">foo</div>
    `), [{ $:'div', attrs:{ id: 'foobar', 'foo-bar': '', 'bar-foo': 'foo[bar]' }, _:'foo' }] )

  })

  it('several p', function () {

    assert.deepEqual( parseHTML(`
    <p>Lorem ipsum...</p><p>dolor sit...</p><p>amet...</p>
    `),[
      { $: 'p', _: 'Lorem ipsum...' },
      { $: 'p', _: 'dolor sit...' },
      { $: 'p', _: 'amet...' },
    ] )

  })

  it('throws', function () {

    assert.throws( () => parseHTML('<div id="foobar">'), Error )

  })

  it('lt in attributes', function () {

    assert.deepEqual( parseHTML(`
<div data-if=" foo < bar ">foobar</div>
    `), [{ $:'div', attrs: { 'data-if': 'foo < bar' }, _:'foobar' }] )

  })

  it('gt in attributes', function () {

    assert.deepEqual( parseHTML(`
<div data-if=" foo > bar ">foobar</div>
    `), [{ $:'div', attrs: { 'data-if': 'foo > bar' }, _:'foobar' }] )

  })

  it('lt && gt in attributes', function () {

    assert.deepEqual( parseHTML(`
<div data-if=" foo < bar && foo > bar ">foobar</div>
    `), [{ $:'div', attrs: { 'data-if': 'foo < bar && foo > bar' }, _:'foobar' }] )

  })

  it('several lt attributes', function () {

    assert.deepEqual( parseHTML(`
<foo-bar foo=" bar < foo && bar < foo "></foo-bar>
    `), [{ $:'foo-bar', attrs: { foo: 'bar < foo && bar < foo' } }] )

  })

  it('several gt attributes', function () {

    assert.deepEqual( parseHTML(`
<foo-bar foo=" bar > foo && bar > foo "></foo-bar>
    `), [{ $:'foo-bar', attrs: { foo: 'bar > foo && bar > foo' } }] )

  })

  it('several lt && gt attributes', function () {

    assert.deepEqual( parseHTML(`
<foo-bar foo=" bar > foo && bar < foo && bar < foo && bar > foo "></foo-bar>
    `), [{ $:'foo-bar', attrs: { foo: 'bar > foo && bar < foo && bar < foo && bar > foo' } }] )

  })

  it('several lines attributes', function () {

    assert.deepEqual( parseHTML(`
<foo-bar
  foo="bar"
  bar="foo"></foo-bar>
    `), [{ $:'foo-bar', attrs: { foo: 'bar', bar: 'foo' } }] )

  })

  it('gt x2 in attributes', function () {

    assert.deepEqual( parseHTML(`
<div data-if=" foo > bar || bar > foo ">foobar</div>
    `), [{ $:'div', attrs: { 'data-if': 'foo > bar || bar > foo' }, _:'foobar' }] )

  })

  it('script', function () {

    assert.deepEqual( parseHTML(`
<script template:type="text/javascript">
  var foo = 'bar';
</script>
    `), [{ $:'script', attrs: { 'template:type': 'text/javascript' }, _:`
  var foo = 'bar';
` }] )

  })

  it('simple comments', function () {

    assert.deepEqual( parseHTML(`
<!-- foo bar -->
    `), [{ comments: ' foo bar ' }] )

  })

  it('commented script', function () {

    assert.deepEqual( parseHTML(`
<!--<script template:type="text/javascript">
  var foo = 'bar';
</script>-->
    `), [{ comments: `<script template:type="text/javascript">
  var foo = 'bar';
</script>` }] )

  })

  it('remove_comments', function () {

    assert.deepEqual( parseHTML(`
<!--<script template:type="text/javascript">
  var foo = 'bar';
</script>-->
    `, { remove_comments: true }), [] )

  })

  it('remove_comments (2)', function () {

    assert.deepEqual( parseHTML(`
foo <!--<script template:type="text/javascript">
  var foo = 'bar';
</script>--> bar
    `, { remove_comments: true }), ['foo ', ' bar'] )

  })

  it('code', function () {

    assert.deepEqual( parseHTML(`
<pre><code class="language-html">
<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
<html>
</code></pre>
    `), [{ $:'pre', _: [{
      $: 'code', attrs: { class: 'language-html' }, _: `
<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
<html>
`
    }] }] )

  })

  it('img', function () {

    assert.deepEqual( parseHTML(`
<div class=" -img ">
  <img src="data:image/svg+xml,%3Csvg width='118' height='120' viewBox='0 0 118 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctitle%3Einfo-lg%3C/title%3E%3Cg fill='%232B85C2' fill-rule='evenodd'%3E%3Ccircle opacity='.16' cx='63' cy='65' r='55'/%3E%3Cpath d='M56 76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0-42c-1.657 0-3 1.347-3 3v24c0 1.657 1.347 3 3 3 1.657 0 3-1.347 3-3V37c0-1.657-1.347-3-3-3z'/%3E%3Cpath d='M110 55c0-30.376-24.624-55-54.495-55C24.625 0 0 24.624 0 55s24.624 55 55.505 55C85.375 110 110 85.376 110 55zM55.505 4C83.167 4 106 26.833 106 55s-22.833 51-50.495 51C26.833 106 4 83.167 4 55S26.833 4 55.505 4z'/%3E%3C/g%3E%3C/svg%3E" />
</div>
    `), [
      { $:'div',
        attrs: {
          'class': '-img'
        },
        _: [
          { $: 'img',
            attrs: {
              src: "data:image/svg+xml,%3Csvg width='118' height='120' viewBox='0 0 118 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctitle%3Einfo-lg%3C/title%3E%3Cg fill='%232B85C2' fill-rule='evenodd'%3E%3Ccircle opacity='.16' cx='63' cy='65' r='55'/%3E%3Cpath d='M56 76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0-42c-1.657 0-3 1.347-3 3v24c0 1.657 1.347 3 3 3 1.657 0 3-1.347 3-3V37c0-1.657-1.347-3-3-3z'/%3E%3Cpath d='M110 55c0-30.376-24.624-55-54.495-55C24.625 0 0 24.624 0 55s24.624 55 55.505 55C85.375 110 110 85.376 110 55zM55.505 4C83.167 4 106 26.833 106 55s-22.833 51-50.495 51C26.833 106 4 83.167 4 55S26.833 4 55.505 4z'/%3E%3C/g%3E%3C/svg%3E" // eslint-disable-line
            },
            self_closed: true,
          }
        ]
      }
    ] )

  })

})

/** */
})
/** */
