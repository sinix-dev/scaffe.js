const fs = require("fs")
const ejs = require("ejs")
const ncp = require("ncp")
const path = require("path")
const glob = require("glob")

ncp.limit = 16

const eval = (filepath, newpath, values) => {
  const filename = path.basename(filepath)

  if(filename[0] == "_"){
    const content = fs.readFileSync(filepath)

    const eval_content = ejs.render(content.toString(), values)

    newpath = path.join(path.dirname(newpath), filename.substr(1))

    fs.writeFile(newpath, eval_content, (err) => {
      if (err) throw err
    })

    return false
  }

  return true
}

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
