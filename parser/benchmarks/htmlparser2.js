
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
	console.log('finished parsing ' + key + '.html')
})

bench.on('result', function (stat) {
	console.log(stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6))
})
