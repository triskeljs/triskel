
import assert from 'assert'
import template from '../template'
import fs from 'fs'
import path from 'path'

function _readFile(filepath) {
  return fs.readFileSync(path.resolve(__dirname, filepath), 'utf8')
}

var example_html = _readFile('./example.html')
var example_result_html = _readFile('./example-result.html')

var data = {
  lang: 'en-US',
  is_dev: true,
  profile: {
    first_name: 'John',
  },
  list: [
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
    'Aliquam tincidunt mauris eu risus.',
    'Vestibulum auctor dapibus neque.',
    'Nunc dignissim risus id metus.',
    'Cras ornare tristique elit.',
    'Vivamus vestibulum ntulla nec ante.',
    'Praesent placerat risus quis eros.',
    'Fusce pellentesque suscipit nibh.',
    'Integer vitae libero ac risus egestas placerat.',
    'Vestibulum commodo felis quis tortor.',
    'Ut aliquam sollicitudin leo.',
    'Cras iaculis ultricies nulla.',
    'Donec quis dui at dolor tempor interdum.',
  ],
}

describe('README', function () {

  it('example', function () {

    assert.strictEqual( template(example_html, data), example_result_html )
    assert.strictEqual( template(example_html)(data), example_result_html )

  })

})
