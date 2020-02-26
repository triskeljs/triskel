/* global it */

import assert from 'assert'

export function runErrorCase () {

  const args = [].slice.call(arguments, 0)

  const _runFn = args.shift()

  it(
    args.map( (expected_error) => {
      return expected_error && expected_error.name || expected_error
    }).join(', ') , () => {

    args.forEach( (expected_error) => {
      assert.throws(_runFn, expected_error, expected_error && expected_error.name || expected_error)
    })

  })

}

export function runErrorsTestSuite (test_suite) {
  test_suite.forEach((test_case) => runErrorCase.apply(null, test_case))
}
