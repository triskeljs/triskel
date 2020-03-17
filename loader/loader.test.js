
import loadHTML from './loader'
import assert from 'assert'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('loader', function () {

  it('div', function () {

    assert.strictEqual( loadHTML(`
<div id="foobar">foo</div>
    `), `export default [{attrs:{id:'foobar'},content:['foo'],tag:'div'}];` )

  })

  it('div (cjs)', function () {

    assert.strictEqual( loadHTML(`
<div id="foobar">foo</div>
    `, { cjs: true }), `module.exports = [{attrs:{id:'foobar'},content:['foo'],tag:'div'}];` )

  })

  it('style', function () {

    assert.strictEqual( loadHTML(`<style>
  @import '/assets/styles.css';
</style>`), `export default [{content:["\\n  @import '/assets/styles.css';\\n"],tag:'style'}];` )

  })

  it('with comments', function () {

    assert.strictEqual( loadHTML(`<style>
  @import '/assets/styles.css';
</style><!-- foobar -->`, { remove_comments: false }), `export default [{content:["\\n  @import '/assets/styles.css';\\n"],tag:'style'},{comments:' foobar '}];` )

  })

  it('comments removed implicitly', function () {

    assert.strictEqual( loadHTML(`<style>
  @import '/assets/styles.css';
</style><!-- foobar -->`), `export default [{content:["\\n  @import '/assets/styles.css';\\n"],tag:'style'}];` )

  })

  it('comments removed explicitly', function () {

    assert.strictEqual( loadHTML(`<style>
  @import '/assets/styles.css';
</style><!-- foobar -->`, { remove_comments: true }), `export default [{content:["\\n  @import '/assets/styles.css';\\n"],tag:'style'}];` )

  })

})

/** */
})
/** */
