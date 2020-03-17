
import assert from 'assert'
import template from '../template'

import { runErrorsTestSuite } from '../../_common/test.helpers'

describe('statement', function () {

  runErrorsTestSuite([
    [() => template.cmd(null), Error, TypeError, /statement \(cmd\) name should be a String/],
    [() => template.cmd(123), Error, TypeError, /statement \(cmd\) name should be a String/],
    [() => template.cmd([]), Error, TypeError, /statement \(cmd\) name should be a String/],
    [() => template.cmd('foo', 123), Error, TypeError, /statement function should be a Function/],
    [() => template.cmd('foo', []), Error, TypeError, /statement function should be a Function/],
  ])

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

  function _runStatementTestCase (statement_name, statementFn, self_closed, text, data, expected_result) {

    it(`$${ statementFn.toString().replace(/^function/, statement_name) }, '${ text }' + ${ JSON.stringify(data) } => '${ expected_result }'`, function () {

      const t = template.context()

      t.statement(statement_name, statementFn, self_closed)

      assert.strictEqual(
        t(text, data),
        expected_result,
      )

    })

  }

  [

    ['foo', function () {  }, true, 'Hi $if{ true }John{/}!', {}, 'Hi John!' ],
    ['foo', function (expression) { return expression + ':foo' }, true, 'Hi $foo{ name }!', {}, 'Hi  name :foo!' ],
    ['foo', function (expression, _scope, renderContent) { return expression === ' bar ' ? renderContent() : '' }, false, 'Hi $foo{ bar }foobar{/}!', {}, 'Hi foobar!' ],
    ['foo', function (expression, _scope, renderContent) { return expression === ' bar ' ? renderContent() : '' }, false, 'Hi $foo{ bar }foobar{/foo}!', {}, 'Hi foobar!' ],
    

  ].forEach( (test_case) => _runStatementTestCase.apply(null, test_case) )

  // runErrorsTestSuite([
  //   [() => template('${ foo }foobar{/}'), Error, /each expression is not correct " foo "/],
  // ])

  // it('throw missing statement', function () {
    
  //   assert.throws(function () {
  //     template('$foobar{ bar }', {})
  //   })
    
  // })

})
