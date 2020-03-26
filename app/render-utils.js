
import { isInList } from '../_common/list'

function _noop () {}

export function alwaysFunction (fn, fn_name) {
  if( fn instanceof Function ) return fn
  if( fn && typeof fn === 'object' ) return () => fn
  throw new TypeError( (fn_name || 'alwaysFunction(fn)') + ' should be a Function or an Object')
}

export function detachQueue (parent_el) {
  var detach_queue = [],
      mutation_observer = typeof MutationObserver === 'function'
        ? new MutationObserver(function(mutations) {
  
          mutations.forEach(function(mutation) {
            _processDetachQueue(mutation.removedNodes)
          })
  
        })
        : { observe: _noop, disconnect: _noop }

  function _processDetachQueue (detached_nodes) {
    for( var i = detach_queue.length - 1 ; i >= 0 ; i-- ) {
      if( isInList(detached_nodes, detach_queue[i].el) ) {
        detach_queue[i].listener.call(detach_queue[i].el)
        detach_queue.splice(i, 1)
      }
    }
    if( detach_queue.length === 0 ) mutation_observer.disconnect()
  }

  function onDetach (listener) {
    if( !detach_queue.length ) mutation_observer.observe(parent_el, { childList: true, subtree: true })
    detach_queue.push({ el: this, listener: listener })
  }

  return {
    onDetach,
  }
}

export function nodeMethods (methods_list) {
  const queues = methods_list.reduce(function (queues, method_name) {
    queues[method_name] = []
    return queues
  }, {})

  return {
    addWithNode (_result) {
      methods_list.forEach( (method_name) => {
        if (!_result[method_name]) return
        
        if (typeof _result[method_name] !== 'function') {
          throw new TypeError(method_name + ' should be a Function')
        }
        queues[method_name].push(_result[method_name])
      })
    },
    generateInitNode (_nodeThis) {
      return methods_list.reduce( (with_node, method_name) => {
        if (queues[method_name].length) {
          with_node[method_name] = function () {
            queues[method_name].forEach( (_nodeFn) => _nodeFn.apply(_nodeThis.apply(this, arguments), arguments) )
          }
        }

        return with_node
      }, {})
    },
  }
}
