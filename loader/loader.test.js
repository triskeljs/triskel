/* global describe, it */

var loadHTML = require('./loader'),
    assert = require('assert')

describe('loader', function () {

  it('div', function () {

    assert.strictEqual( loadHTML(`
<div id="foobar">foo</div>
    `), `export default [{attrs:{id:'foobar'},_:'foo',$:'div'}];` )

  })

  it('style', function () {

    assert.strictEqual( loadHTML(`<style>
  @import '/assets/styles.css';
</style>`), `export default [{_:"\\n  @import '/assets/styles.css';\\n",$:'style'}];` )

  })

  it('with comments', function () {

    assert.strictEqual( loadHTML(`<style>
  @import '/assets/styles.css';
</style><!-- foobar -->`, { remove_comments: false }), `export default [{_:"\\n  @import '/assets/styles.css';\\n",$:'style'},{comments:' foobar '}];` )

  })

  it('comments removed implicitly', function () {

    assert.strictEqual( loadHTML(`<style>
  @import '/assets/styles.css';
</style><!-- foobar -->`), `export default [{_:"\\n  @import '/assets/styles.css';\\n",$:'style'}];` )

  })

  it('comments removed explicitly', function () {

    assert.strictEqual( loadHTML(`<style>
  @import '/assets/styles.css';
</style><!-- foobar -->`, { remove_comments: true }), `export default [{_:"\\n  @import '/assets/styles.css';\\n",$:'style'}];` )

  })

})
