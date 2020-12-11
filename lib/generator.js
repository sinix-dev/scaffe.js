const fs = require("fs")
const ncp = require("ncp")
const path = require("path")
const glob = require("glob")
const eval = require("./eval.js")

ncp.limit = 16

module.exports = (templateDir, outDir, values, cb) => {
  fs.mkdir(outDir, (err) => {
    if (err) return cb(err)

    outDir = path.resolve(outDir)

    glob("**/*", { cwd: templateDir }, (err, res) => {
      if (err) return cb(err)

      for(file of res){
        const filepath = path.join(templateDir, file)

        newpath = path.join(outDir, file)
        dirname = path.dirname(newpath)

        fs.mkdirSync(dirname, { recursive: true })

        if(eval(filepath, newpath, values)){
          ncp(filepath, newpath, (err) => {
            if (err) return cb(err)
          })
        }
      }

      cb()
    })
  })
}
