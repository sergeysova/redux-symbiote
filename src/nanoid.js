/* eslint-disable global-require */
if (typeof document !== "undefined") {
  // web
  module.exports = require("nanoid")
} else if (
  typeof navigator !== "undefined" &&
  navigator.product === "ReactNative"
) {
  // react native
  module.exports = require("nanoid/non-secure")
} else {
  // nodejs
  module.exports = require("nanoid/non-secure")
}
