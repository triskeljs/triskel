
import triskelRollupLoader from './rollup'
import assert from 'assert'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
// --------------------------------------

describe('loader', function () {

  it('template.html', function () {

    const triskel_processor = triskelRollupLoader()

    assert.strictEqual( triskel_processor.transform(`
<div id="foobar">foo</div>
    `, 'template.html').code, `export default [{attrs:{id:'foobar'},content:['foo'],tag:'div'}];` )

  })

  it('template.html (include: "*.html")', function () {

    const triskel_processor = triskelRollupLoader({ include: '*.html' })

    assert.strictEqual( triskel_processor.transform(`
<div id="foobar">foo</div>
    `, 'template.html').code, `export default [{attrs:{id:'foobar'},content:['foo'],tag:'div'}];` )

  })

  it('template.js', function () {

    const triskel_processor = triskelRollupLoader()

    assert.strictEqual( triskel_processor.transform(`const foo = 'bar'`, 'template.js'), null )

  })

  it('template.js (include: "*.html")', function () {

    const triskel_processor = triskelRollupLoader({ include: '*.html' })

    assert.strictEqual( triskel_processor.transform(`const foo = 'bar'`, 'template.js'), null )

  })

})

/** */
})
/** */
