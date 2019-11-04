/* eslint-disable global-require, no-restricted-globals */
let globalSelf = null

if (typeof window !== "undefined") {
  globalSelf = window
} else if (typeof global !== "undefined") {
  globalSelf = global
} else if (typeof self !== "undefined") {
  globalSelf = self
}

const document = globalSelf && globalSelf.document
const crypto = globalSelf && (globalSelf.crypto || globalSelf.msCrypto)
const navigator = globalSelf && globalSelf.navigator

if (document && crypto) {
  // web
  module.exports = require("nanoid")
} else if (navigator && navigator.product === "ReactNative") {
  // react native
  module.exports = require("nanoid/non-secure")
} else {
  // nodejs
  module.exports = require("nanoid/non-secure")
}
