// @ts-check

/**
 * Evaluate ejs template file and create a new file
 * with the evaluated template content in it
 * @module eval
 */

const fs = require("fs")
const ejs = require("ejs")
const path = require("path")

/**
 * Process only ejs files and copies to newpath
 * returns true if not an ejs file or file doesn't exist.
 *
 * @param {string} filepath - source file path
 * @param {string} newpath - path to the target file
 * @param {object} variables - variables to be resolved in ejs template
 *
 * @return {Promise<void>}
 */
module.exports = (filepath, newpath, variables) => {
  return new Promise((resolve, reject) => {
    const dirname = path.dirname(newpath)

    fs.mkdirSync(dirname, { recursive: true })

    const filename = path.basename(filepath)

    if (fs.existsSync(filepath) && fs.lstatSync(filepath).isDirectory()){
      resolve()
    }

    if (filename[0] === "_"){
      const content = fs.readFileSync(filepath, {
        encoding: "utf8",
      })

      try {
        const eval_content = ejs.render(content.toString(), variables)

        fs.writeFileSync(newpath, eval_content)
      } catch (err){
        reject(err)
      }

      return resolve()
    } else {
      try {
        fs.copyFileSync(filepath, newpath)
      } catch (err){
        reject(err)
      }
    }

    resolve()
  })
}
