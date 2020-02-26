
export function firstIn (list, iteratee, this_arg) {
  for( var i = 0, n = list.length; i < n ; i++ ) {
    if( iteratee.call(this_arg, list[i]) ) return list[i]
  }
  return null
}
