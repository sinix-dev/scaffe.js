# scaffe.js
Simple scaffolding utility that powers [create-sinix-app](https://github.com/sinix-dev/create-sinix-app)

### Installation
```bash
$ npm install scaffe --save
```

### Programmatic Usage

```js
const scaffe = require("scaffe")

...

scaffe.generate(template_dir, outDir, { name: outDir }, (err) => {
  if(err){
    console.error(err)
  } else {
    console.log("Successfully generated")
  }
})
```
