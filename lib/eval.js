const fs = require("fs")
const ejs = require("ejs")
const path = require("path")

module.exports = (filepath, newpath, values) => {
  const filename = path.basename(filepath)

  if(fs.existsSync(filepath) && fs.lstatSync(filepath).isDirectory()){
    return false
  }

  if(filename[0] === "_"){
    const content = fs.readFileSync(filepath)
    const eval_content = ejs.render(content.toString(), values)

    newpath = path.join(path.dirname(newpath), filename.substr(1))

    fs.writeFileSync(newpath, eval_content)

    return false
  }

  return true
}
