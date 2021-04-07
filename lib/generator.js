const fs = require("fs")
const path = require("path")
const glob = require("glob")
const eval = require("./eval.js")

module.exports = (templateDir, outDir, values) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(outDir, (err) => {
      if (err) return reject(err)

      outDir = path.resolve(outDir)

      glob("**/*", { cwd: templateDir }, (err, res) => {
        if (err) return reject(err)

        for(file of res){
          const filepath = path.join(templateDir, file)

          newpath = path.join(outDir, file)
          dirname = path.dirname(newpath)

          fs.mkdirSync(dirname, { recursive: true })

          if(eval(filepath, newpath, values)){
            try {
              fs.copyFileSync(filepath, newpath)
            } catch (err) {
              reject(err)
            }
          }
        }

        resolve();
      })
    })
  })
}
