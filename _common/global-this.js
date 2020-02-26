/* global self, window, global, globalThis  */

export function getGlobal () {
  // ECMAScript modules
	if (typeof self !== 'undefined' && self) return self

  // browsers
	if (typeof window !== 'undefined' && window) return window

  // NodeJS
	if (typeof global !== 'undefined' && global) return global

	// new globalThis standard
	if (typeof globalThis !== 'undefined' && globalThis) return globalThis
}

const global_this = getGlobal()

export { global_this as global }
