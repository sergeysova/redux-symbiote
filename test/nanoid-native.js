import test from "ava"

global.navigator = {
  product: "ReactNative",
}

const expected = require("nanoid/non-secure")
const imported = require("../src/nanoid")

test("should load non-secure nanoid", (t) => {
  t.true(expected === imported)
})
