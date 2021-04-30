<img src="https://raw.githubusercontent.com/sinix-dev/scaffe.js/master/.github/assets/scaffe-logo.png" width="400">

[![Tests workflow](https://github.com/sinix-dev/scaffe.js/actions/workflows/test.js.yml/badge.svg)](https://github.com/sinix-dev/scaffe.js/actions/workflows/test.js.yml)
[![](https://img.shields.io/npm/v/scaffe.svg)](https://www.npmjs.com/package/scaffe)
[![](https://img.shields.io/npm/l/scaffe)](https://github.com/sinix-dev/scaffe.js/blob/master/LICENSE)

Simple scaffolding utility, inspired by [Sao.js](https://github.com/saojs/sao)

### Installation

```bash
$ npm install scaffe # yarn add scaffe
```

### Programmatic Usage

```js
const scaffe = require("scaffe")

async function main(){
  ...

  // create a generator instance
  const s = scaffe.generate(templateDir, outDir, { overwrite: true, variables: { name: "app" } })

  // add a file from outside the templateDir
  // the source path should be relative to templateDir
  s.add("../common/logo.png", "assets/logo.png")

  // add multiple files using glob pattern to the target project directory
  // the source path should be relative to templateDir
  s.add("../common/styles/*.scss", "static/css/")

  // ignore certain files
  s.ignore("docs/**/*.scss")

  // ignore certain folder
  s.ignore("build/**/*")

  try {
    await s;
  } catch(err) {
    console.log(err)
  }
}
```

**Template directory can have two types of files** <br>
- `starts with _`: this file will be evaluated as an ejs file <br>
- `doesn't starts with _`: this type of files will be copied as it is to the output directory.

So we can use variables in our template files in [ejs](https://ejs.co/) format.

**A use case,**

```javascript
// _package.json

{
  "name": "<%= appName %>"
}
```

`variables` in 3rd argument (i.e. config) will contain all variable values that
need to be passed on to be processed by [ejs](https://ejs.co/).

[MORE ON USING SCAFFE](https://github.com/sinix-dev/scaffe.js/wiki/Using-Scaffe)
