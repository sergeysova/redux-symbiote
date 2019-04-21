import test from "ava"

global.document = {}

const expected = require("nanoid")
const imported = require("../src/nanoid")

test("should load secure nanoid", (t) => {
  t.true(expected === imported)
})
