const generator = require("./generator")
const mock = require("mock-fs")
const fs = require("fs")

beforeEach(async() => {
  mock({
    "common": {
      js: {
        "one.js": "console.log(\"this is one.js\")",
        "two.js": "console.log(\"this is two.js\")",
        "three.js": "console.log(\"this is three.js\")",
        "one.ts": "console.log(\"this is one.ts\")",
        "two.ts": "console.log(\"this is two.ts\")",
        "three.ts": "console.log(\"this is three.ts\")",
        "one.mjs": "console.log(\"this is one.mjs\")",
        "two.mjs": "console.log(\"this is two.mjs\")",
        "three.mjs": "console.log(\"this is three.mjs\")",
      },
    },
    "template": {
      src: {
        "main.js": "console.log(\"hey!\");",
        "_index.js": "console.log(\"<%= name %> v<%= version %>\");",
        dist: {
          "index.html": "<html></html>",
        },
        ".gitignore": "node_modules/",
        ".git": { "index": "" }
      },
      "_package.json": `
        {
          "name": "<%= name %>",
          "version": "<%= version %>"
        }
      `,
    },
    "conflict-template": {
      src: {
        "_index.js": "console.log(\"<%= name %> v<%= version %>\");",
        "index.js": "console.log(\"<%= name %> v<%= version %>\");",
      },
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

test("folder name is correct", async() => {
  expect.assertions(1)

  return generator("template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  })
    .then(() => {
      expect(fs.existsSync("app")).toBe(true)
    })
    .catch((err) => {
      expect(err).toBeFalsy()
    })
})

test("created file from ejs template has correct content based on variables", async() => {
  expect.assertions(1)

  return generator("template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  }).then(() => {
    const content = fs.readFileSync("./app/package.json", {
      encoding: "utf8",
    })

    expect(content).toBe(`
        {
          "name": "sinix",
          "version": "0.1.0"
        }
      `)
  })
})

test("files which aren't a part of template stays intact on overwrite", async() => {
  expect.assertions(1)

  return generator("template", "test-app", {
    overwrite: true,
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  }).then(() => {
    const content = fs.readFileSync("./test-app/src/test.js", {
      encoding: "utf8",
    })

    expect(content).toBe("// this is supposed to be prebuilt file")
  })
})

test("overwrite file if already exist; on overwrite = true", async() => {
  expect.assertions(1)

  return generator("template", "test-app", {
    overwrite: true,
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  }).then(() => {
    const content = fs.readFileSync("./test-app/src/index.js", {
      encoding: "utf8",
    })

    expect(content).toBe("console.log(\"sinix v0.1.0\");")
  })
})

test("throws error if target directory already exist", async() => {
  expect.assertions(1)

  try {
    await generator("template", "test-app", {
      variables: {
        name: "sinix",
        version: "0.1.0",
      },
    })
  } catch (err){
    expect(err.code).toBe("EEXIST")
  }
})

test("don't add file if ignored", async() => {
  expect.assertions(1)

  const s = generator("template", "app", {
    overwrite: true,
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  })

  s.ignore("src/main.js")

  await s

  expect(fs.existsSync("app/src/main.js")).toBe(false)
})

test("copy dot files if dot is passed true in config", async() => {
  expect.assertions(2)

  const s = generator("template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
    dot: true
  })

  await s

  expect(fs.existsSync("app/src/.gitignore")).toBe(true)
  expect(fs.existsSync("app/src/.git")).toBe(true)
})

test("ignore dot files and folder", async() => {
  expect.assertions(2)

  const s = generator("template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
    dot: true
  })

  s.ignore("src/.git/**")
  s.ignore("src/.gitignore")

  await s

  expect(fs.existsSync("app/src/.git")).toBe(false)
  expect(fs.existsSync("app/src/.gitignore")).toBe(false)
})

test("copy file to a custom place", async() => {
  expect.assertions(2)

  const s = generator("template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  })

  s.add("src/main.js", "src/bleh.js")

  await s

  expect(fs.existsSync("app/src/bleh.js")).toBe(true)
  expect(fs.existsSync("app/src/main.js")).toBe(false)
})

test("glob pattern is working", async() => {
  expect.assertions(9)

  const s = generator("template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  })

  s.add("../common/**/*.js", "scripts/")

  await s

  expect(fs.existsSync("app/scripts/one.js")).toBe(true)
  expect(fs.existsSync("app/scripts/two.js")).toBe(true)
  expect(fs.existsSync("app/scripts/three.js")).toBe(true)
  expect(fs.existsSync("app/scripts/one.ts")).toBe(false)
  expect(fs.existsSync("app/scripts/two.ts")).toBe(false)
  expect(fs.existsSync("app/scripts/three.ts")).toBe(false)
  expect(fs.existsSync("app/scripts/one.mjs")).toBe(false)
  expect(fs.existsSync("app/scripts/two.mjs")).toBe(false)
  expect(fs.existsSync("app/scripts/three.mjs")).toBe(false)
})

test("adding multiple files to the same folder", async() => {
  expect.assertions(9)

  const s = generator("template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  })

  s.add("../common/js/*.js", "scripts/")
  s.add("../common/js/*.ts", "scripts/")

  await s

  expect(fs.existsSync("app/scripts/one.js")).toBe(true)
  expect(fs.existsSync("app/scripts/two.js")).toBe(true)
  expect(fs.existsSync("app/scripts/three.js")).toBe(true)
  expect(fs.existsSync("app/scripts/one.ts")).toBe(true)
  expect(fs.existsSync("app/scripts/two.ts")).toBe(true)
  expect(fs.existsSync("app/scripts/three.ts")).toBe(true)
  expect(fs.existsSync("app/scripts/one.mjs")).toBe(false)
  expect(fs.existsSync("app/scripts/two.mjs")).toBe(false)
  expect(fs.existsSync("app/scripts/three.mjs")).toBe(false)
})

test("matching multiple files of different extensions using glob", async() => {
  expect.assertions(9)

  const s = generator("template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  })

  s.add("../common/js/*.(js|ts)", "scripts/")

  await s

  expect(fs.existsSync("app/scripts/one.js")).toBe(true)
  expect(fs.existsSync("app/scripts/two.js")).toBe(true)
  expect(fs.existsSync("app/scripts/three.js")).toBe(true)
  expect(fs.existsSync("app/scripts/one.ts")).toBe(true)
  expect(fs.existsSync("app/scripts/two.ts")).toBe(true)
  expect(fs.existsSync("app/scripts/three.ts")).toBe(true)
  expect(fs.existsSync("app/scripts/one.mjs")).toBe(false)
  expect(fs.existsSync("app/scripts/two.mjs")).toBe(false)
  expect(fs.existsSync("app/scripts/three.mjs")).toBe(false)
})

test("ignore multiple files of certain extension", async() => {
  expect.assertions(9)

  const s = generator("template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  })

  s.add("../common/js/*", "scripts/")
  s.ignore("../common/js/*.(ts|mjs)")

  await s

  expect(fs.existsSync("app/scripts/one.js")).toBe(true)
  expect(fs.existsSync("app/scripts/two.js")).toBe(true)
  expect(fs.existsSync("app/scripts/three.js")).toBe(true)
  expect(fs.existsSync("app/scripts/one.ts")).toBe(false)
  expect(fs.existsSync("app/scripts/two.ts")).toBe(false)
  expect(fs.existsSync("app/scripts/three.ts")).toBe(false)
  expect(fs.existsSync("app/scripts/one.mjs")).toBe(false)
  expect(fs.existsSync("app/scripts/two.mjs")).toBe(false)
  expect(fs.existsSync("app/scripts/three.mjs")).toBe(false)
})

test("content of explicitly added files from common folder is correct", async() => {
  expect.assertions(9)

  const s = generator("template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  })

  s.add("../common/js/*", "scripts/")
  s.ignore("../common/js/*.(ts|mjs)")

  await s

  expect(fs.readFileSync("app/scripts/one.js", {
    encoding: "utf8",
  })).toBe("console.log(\"this is one.js\")")

  expect(fs.readFileSync("app/scripts/two.js", {
    encoding: "utf8",
  })).toBe("console.log(\"this is two.js\")")

  expect(fs.readFileSync("app/scripts/three.js", {
    encoding: "utf8",
  })).toBe("console.log(\"this is three.js\")")

  expect(fs.existsSync("app/scripts/one.ts")).toBe(false)
  expect(fs.existsSync("app/scripts/two.ts")).toBe(false)
  expect(fs.existsSync("app/scripts/three.ts")).toBe(false)
  expect(fs.existsSync("app/scripts/one.mjs")).toBe(false)
  expect(fs.existsSync("app/scripts/two.mjs")).toBe(false)
  expect(fs.existsSync("app/scripts/three.mjs")).toBe(false)
})
