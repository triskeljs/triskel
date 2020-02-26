/* global self, window, global, globalThis  */

export function getGlobal () {
  // ECMAScript modules
  /* istanbul ignore next  */
	if (typeof self !== 'undefined' && self) return self

  // browsers
  /* istanbul ignore next  */
	if (typeof window !== 'undefined' && window) return window

  // NodeJS
  /* istanbul ignore next  */
	if (typeof global !== 'undefined' && global) return global

  // new globalThis standard
  /* istanbul ignore next  */
	if (typeof globalThis !== 'undefined' && globalThis) return globalThis
}

const global_this = getGlobal()

export { global_this as global }
