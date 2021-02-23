
/* global require */

var benchmark = require('htmlparser-benchmark')
var Parser = require('htmlparser2').Parser

var bench = benchmark(function (html, callback) {
  var parser = new Parser({
    onend: callback,
    onerror: callback,
  })
  parser.end(html)
})

bench.on('progress', function (key) {
  // eslint-disable-next-line no-console
  console.log('finished parsing ' + key + '.html')
})

bench.on('result', function (stat) {
  // eslint-disable-next-line no-console
  console.log(stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6))
})
