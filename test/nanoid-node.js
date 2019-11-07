import test from "ava"

const expected = require("nanoid/non-secure")
const imported = require("../src/nanoid")

test("should load non-secure nanoid", (t) => {
  t.true(expected === imported)
})
