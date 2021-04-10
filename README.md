<img src="https://raw.githubusercontent.com/sinix-dev/scaffe.js/feat/release-changes/.github/assets/scaffe-logo.png" width="400">
<hr>

[![Tests workflow](https://github.com/sinix-dev/scaffe.js/actions/workflows/test.js.yml/badge.svg)](https://github.com/sinix-dev/scaffe.js/actions/workflows/test.js.yml)
[![](https://img.shields.io/npm/v/tauri.svg)](https://www.npmjs.com/package/scaffe)
[![](https://img.shields.io/npm/l/scaffe)](https://github.com/sinix-dev/scaffe.js/blob/master/LICENSE)

Simple scaffolding utility, inspired by [Sao.js](https://github.com/saojs/sao)

### Installation

```bash
$ npm install scaffe # yarn add scaffe
```

### Programmatic Usage

```js
const scaffe = require("scaffe")

async function build(){
  ...
  try {
    await scaffe.generate(templateDir, outDir, { overwrite: true, variables: { name: "app" } });
  } catch(err) {
    console.log(err)
  }

  // OR

  scaffe.generate(templateDir, outDir, { overwrite: true, variables: { name: "app" }).catch((err) => {
    console.log(err);
  })
  
  scaffe.generate(templateDir, outDir, variables, (err) => {
    console.log(err);
  })
}
```

### More Info

The only available function in Scaffe is `generate` which takes arguments as
following in order.

- `templateDir`: It's the path to the template directory. <br>
- `outDir`: The output directory <br>
- `config`: An Object with two props `{boolean} overwrite (by default false)`, `{object} variables` <br>

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
