
import assert from 'assert'

import {
  extend,
} from './object'

/** define-property */
describe(__filename.substr(process.cwd().length), function () {
  // --------------------------------------

  describe('extend', function () {

    function _runTestCase(dest, src, expected_result) {
      it(`${ JSON.stringify(dest) } + ${ JSON.stringify(src) } -> ${ JSON.stringify(expected_result) }`, function () {
        assert.deepStrictEqual(
          extend(dest, src),
          expected_result,
        )
      })
    }

    [

      [{ foo: 'foo' }, { bar: 'bar' }, { foo: 'foo', bar: 'bar' }],

    ].forEach((test_case) => _runTestCase.apply(null, test_case))

  })

})
