
export function firstIn (list, iteratee, this_arg) {
  for( var i = 0, n = list.length; i < n ; i++ ) {
    if( iteratee.call(this_arg, list[i]) ) return list[i]
  }
  return null
}

export function pipeProcessor (list, pipeFn) {
  if (!Array.isArray(list)) throw new TypeError('list should be an Array')
  if (typeof pipeFn !== 'function') throw new TypeError('pipeFn should be an Function')

  return list
    .reduce((dataIn, item) => {
      const processData = pipeFn(item)
      if (typeof processData !== 'function') throw new TypeError('pipeFn in pipeProcessor(list, pipeFn) should return a Function')
      return function _processData () {
        return processData.apply(this, [dataIn.apply(this, arguments)].concat([].slice.call(arguments, 1)))
      }
    }, (data) => data )
}
