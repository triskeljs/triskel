
// https://stackoverflow.com/questions/1661197/what-characters-are-valid-for-javascript-variable-names/9337047#9337047

var ecma_keywords = {}

'null,true,false,undefined,arguments,break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,new,return,super,switch,this,throw,try,typeof,var,void,while,with,yield'.split(',').forEach(function (key) {
  ecma_keywords[key] = true
})

export function removeStrings(text) {
  return text
    .replace(/''|'(.*?[^\\])'/g, '\'\'')
    .replace(/""|"(.*?[^\\])"/g, '""')
}

var match_var = /\.?[a-zA-Z_$][0-9a-zA-Z_$]*/g

export function matchVars (expression, used_vars = Object.create(ecma_keywords) ) {
  return ( removeStrings(expression).match(match_var) || [] )
    .filter(function (var_name) {
      if(
        var_name[0] === '.' // ignoring property invokations
        || used_vars[var_name]  // ignoring already added
      ) return false

      used_vars[var_name] = true
      return true
    })
}

export function parseExpression (expression, options = {}) {
  if( typeof expression !== 'string' ) throw new TypeError('expression should be a String')

  var used_vars = Object.create(ecma_keywords)

  if( options.globals ) options.globals.forEach( (key)  => used_vars[key] = true )

  return {
    expression,
    var_names: matchVars(expression, used_vars),
  }
}

export function _getKeyFromData (data) {
  if( data instanceof Array ) return function _getKeyFromArray (key) {
    for( var i = 0, n = data.length ; i < n ; i++ ) {
      if( key in data[i] ) return data[i][key]
    }
  }

  return function _getKeyFromObject (key) {
    return data[key]
  }
}

export function evalExpression (expression, data) {
  var _parsed = parseExpression(expression, this ? { globals: this.globals } : {})
  var _runExpression = Function.apply(null, _parsed.var_names.concat('return (' + _parsed.expression + ');') )
  var _getVar = _getKeyFromData(data)

  return data
    ? _runExpression.apply(null, _parsed.var_names.map(_getVar) )
    : function _evalExpression (_data) {
      return _runExpression.apply(null, _parsed.var_names.map(_getVar) )
    }
}
