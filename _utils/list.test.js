


import assert from 'assert'
import { runErrorsTestSuite } from './test.helpers'

import {
  firstIn,
  pipeProcessor,
} from './list'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
  // --------------------------------------

  describe('firstIn', function () {

    function _runTestCase(list, iterateeFn, expected_result, this_arg) {
      it(`${list} -> ${iterateeFn.toString()}`, function () {
        assert.deepStrictEqual(
          arguments.length > 3
            ? firstIn(list, iterateeFn, this_arg)
            : firstIn(list, iterateeFn),
          expected_result,
        )
      })
    }

    [

      [[1, 2, 3, 4, 5, 6], (num) => num > 2, 3],
      [[1, 2, 3, 4, 5, 6], (num) => num > 6, null],
      [[1, 2, 3, 4, 5, 6], (num) => num % 2, 1],

    ].forEach((test_case) => _runTestCase.apply(null, test_case))

  })

  describe('pipeProcessor', function () {

    runErrorsTestSuite([
      [() => pipeProcessor(), Error, TypeError, /list should be an Array/],
      [() => pipeProcessor([]), Error, TypeError, /pipeFn should be an Function/],
      [() => pipeProcessor([], null), Error, TypeError, /pipeFn should be an Function/],
      [() => pipeProcessor([1], () => null), Error, TypeError, /pipeFn in pipeProcessor\(list, pipeFn\) should return a Function/],

    ])

    function _runTestCase(pipe_list, reducerFn, data_in, expected_result) {
      it(`${pipe_list} -> ${JSON.stringify(expected_result)}`, function () {
        assert.deepStrictEqual(
          pipeProcessor(pipe_list, reducerFn)(data_in),
          expected_result,
        )
      })
    }

    [

      [[1, 2, 3, 4, 5, 6], (num) => (sum) => num + sum, 0, 21],
      [['foo', 'bar', '123'], (foo) => (bar) => bar + ':' + foo, 'input', 'input:foo:bar:123'],

    ].forEach((test_case) => _runTestCase.apply(null, test_case))

  })

  /** */
})
/** */
