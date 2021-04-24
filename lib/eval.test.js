const evaluate = require("./eval")
const mock = require("mock-fs")
const fs = require("fs")

beforeEach(async() => {
  mock({
    "/template": {
      src: {
        "main.js": "console.log(\"hey <%= name %>!\");",
        "_index.js": "console.log(\"<%= name %> v<%= version %>\");",
        dist: {
          "index.html": "<html></html>",
        },
      },
      "_package.json": `
        {
          "name": "<%= name %>",
          "version": "<%= version %>"
        }
      `,
    },
    "test-app": {
      src: {
        "index.js": "console.log(\"nothing\")",
        "test.js": "// this is supposed to be prebuilt file",
      },
    },
  })
})

afterEach(async() => {
  mock.restore()
})

test("create file with correctly evaluated content", async() => {
  expect.assertions(2)

  return evaluate("/template/src/_index.js", "app/src/index.js", {
    name: "sinix",
    version: "0.1.0",
  })
    .then(() => {
      expect(fs.existsSync("app/src/index.js")).toBe(true)
      const content = fs.readFileSync("app/src/index.js", {
        encoding: "utf8",
      })
      expect(content).toBe("console.log(\"sinix v0.1.0\");")
    })
    .catch((err) => {
      expect(err).toBe({})
    })
})

test("paste file as it is if filename doesn't starts with _", async() => {
  expect.assertions(2)

  return evaluate("/template/src/main.js", "app/src/main.js", {
    name: "sinix",
    version: "0.1.0",
  })
    .then(() => {
      expect(fs.existsSync("app/src/main.js")).toBe(true)
      const content = fs.readFileSync("app/src/main.js", {
        encoding: "utf8",
      })
      expect(content).toBe("console.log(\"hey <%= name %>!\");")
    })
    .catch((err) => {
      expect(err).toBe({})
    })
})
