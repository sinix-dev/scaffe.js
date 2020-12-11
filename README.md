# scaffe.js
Simple scaffolding utility, inspired by [Sao.js](https://github.com/saojs/sao)

### Installation
```bash
$ npm install scaffe --save
```

### Programmatic Usage

```js
const scaffe = require("scaffe")

...

scaffe.generate(template_dir, outDir, { name: appName }, (err) => {
  if(err){
    console.error(err)
  } else {
    console.log("Successfully generated")
  }
})
```

The only available function in Scaffe is `generate` which takes arguments as
following in order.

`templateDir`: It's the path to the template directory. <br>
`outDir`: The output directory <br>
`values`: An Object mapped from variables to it's values <br>
`cb`: A callback function that have `err` as the only argument <br>

Template directory can have two types files <br>
`starts with _`: this file will be evaluated as an ejs file <br>
`doesn't starts with _`: this type of files will be copied as it is to the output directory.

So we can uses variables in our template files in [ejs](https://ejs.co/) format.

A use case,
```javascript
// _package.json

{
  "name": "<%= appName %>"
}
```

`values` i.e. 3rd argument; will contain all variable values that
needs to be passed on to pe processed by [ejs](https://ejs.co/).
