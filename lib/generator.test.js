const generator = require("./generator");
const mock = require("mock-fs");
const fs = require("fs");

beforeEach(async () => {
  mock({
    "/template": {
      src: {
        "main.js": `console.log("hey!");`,
        "_index.js": `console.log("<%= name %> v<%= version %>");`,
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
    "/conflict-template": {
      src: {
        "_index.js": `console.log("<%= name %> v<%= version %>");`,
        "index.js": `console.log("<%= name %> v<%= version %>");`,
      },
    },
    "test-app": {
      src: {
        "index.js": `console.log("nothing")`,
        "test.js": "// this is supposed to be prebuilt file",
      },
    },
  });
});

afterEach(async () => {
  mock.restore();
});

test("folder name is correct", async () => {
  expect.assertions(1);

  return generator("/template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  })
    .then(() => {
      expect(fs.existsSync("app")).toBe(true);
    })
    .catch((err) => {
      expect(err).toBeFalsy();
    });
});

test("created file from ejs template has correct content based on variables", async () => {
  expect.assertions(1);

  return generator("/template", "app", {
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  }).then(() => {
    const content = fs.readFileSync("./app/package.json", {
      encoding: "utf8",
    });

    expect(content).toBe(`
        {
          "name": "sinix",
          "version": "0.1.0"
        }
      `);
  });
});

test("files which aren't a part of template stays intact on overwrite", async () => {
  expect.assertions(1);

  return generator("/template", "test-app", {
    overwrite: true,
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  }).then(() => {
    const content = fs.readFileSync("./test-app/src/test.js", {
      encoding: "utf8",
    });

    expect(content).toBe("// this is supposed to be prebuilt file");
  });
});

test("overwrite file if already exist; on overwrite = true", async () => {
  expect.assertions(1);

  return generator("/template", "test-app", {
    overwrite: true,
    variables: {
      name: "sinix",
      version: "0.1.0",
    },
  }).then(() => {
    const content = fs.readFileSync("./test-app/src/index.js", {
      encoding: "utf8",
    });

    expect(content).toBe(`console.log("sinix v0.1.0");`);
  });
});

test("throws error if target directory already exist", async () => {
  expect.assertions(1);

  try {
    await generator("/template", "test-app", {
      variables: {
        name: "sinix",
        version: "0.1.0",
      },
    })
  } catch(err) {
    expect(err.code).toBe("EEXIST");
  }
});
