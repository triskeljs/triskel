
// https://stackoverflow.com/questions/1661197/what-characters-are-valid-for-javascript-variable-names/9337047#9337047

import { global } from '../_common/global-this'

var ecma_keywords = {}

'null,true,false,undefined,arguments,break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,new,return,super,switch,this,throw,try,typeof,var,void,while,with,yield'.split(',').forEach(function (key) {
  ecma_keywords[key] = true
})

export function removeStrings(text) {
  return text
    .replace(/''|'(.*?[^\\])'/g, "''")
    .replace(/""|"(.*?[^\\])"/g, '""')
}

var match_var = /\.?[a-zA-Z_$][0-9a-zA-Z_$]*/g

export function matchVars (expression, used_vars = Object.create(ecma_keywords) ) {
  if( typeof expression !== 'string' ) throw new TypeError('expression should be a String')
  
  return (
    removeStrings(expression).match(match_var) || []
  )
    .filter(function (var_name) {
      if(
        var_name[0] === '.' // ignoring property invokations
        || used_vars[var_name]  // ignoring already added
      ) return false

      used_vars[var_name] = true
      return true
    })
}

export function parseExpression (expression) {
  if( typeof expression !== 'string' ) throw new TypeError('expression should be a String')

  var used_vars = Object.create(ecma_keywords)

  return {
    expression,
    var_names: matchVars(expression, used_vars),
  }
}

export function _dataScope (base, data_list) {
  var scope = Object.create(base)

  data_list.forEach( (data) => {
    scope = Object.create(scope)
    for (let key in data) scope[key] = data[key]
  })

  return scope
}

export function _getKeyFromData (data) {
  const scope = _dataScope(global, data instanceof Array ? data : [data] )

  return function _getValue (prop) {
    return scope[prop]
  }
}

export function evalExpression (expression, data) {
  const _parsed = parseExpression(expression)
  const var_names = _parsed.var_names
  const _runExpression = Function.apply(null, var_names.concat('return (' + _parsed.expression + ');') )

  return arguments.length > 1
    ? _runExpression.apply(null, var_names.map(_getKeyFromData(data)) )
    : function _evalExpression (_data) {
      return _runExpression.apply(null, var_names.map(_getKeyFromData(_data)) )
    }
}


// export function _getKeyFromData (data) {
//   if( data instanceof Array ) return function _getKeyFromArray (key) {
//     for( var i = 0, n = data.length ; i < n ; i++ ) {
//       if( key in data[i] ) return data[i][key]
//     }
//     return global[key]
//   }

//   return function _getKeyFromObject (key) {
//     return data
//       ? (
//         key in data
//           ? data[key]
//           : global[key]
//       )
//       : global[key]
//   }
// }
