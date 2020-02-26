
import assert from 'assert'
import template from '../template'

describe('statement', function () {

  it('basic', function () {
    var executed = 0
    var _template = template.context()

    _template.statement('foo', function (expression, _scope) {
      executed += 1
      assert.strictEqual(expression, ' bar ')
    }, true)

    _template('$foo{ bar }', {})
    _template('$foo{ bar }')({})

    assert.strictEqual(executed, 2)

  })

  // it('throw missing statement', function () {
    
  //   assert.throws(function () {
  //     template('$foobar{ bar }', {})
  //   })
    
  // })

})
