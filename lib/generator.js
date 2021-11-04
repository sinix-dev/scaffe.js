// @ts-check

/**
 * Create a project from a template
 * @module generator
 */

/**
 * @typedef {object} Configuration
 * @property {boolean} [overwrite=false] - will overwrite the target directory if true, by default false
 * @property {object} [variables = {}] - variables to be resolved in ejs template
 * @property {boolean} [dot=false] - whether to copy dotfiles also or not
 */

const fs = require("fs")
const path = require("path")
const glob = require("fast-glob")
const evaluate = require("./eval.js")

class Generator{
  /**
   * @param {string} templateDir
   * @param {string} outDir
   * @param {Configuration} config
   */
  constructor(templateDir, outDir, config){
    this.templateDir = templateDir
    this.outDir = outDir
    this.config = config
    this.fileMap = {}

    this.init("**/*", outDir)
  }

  /**
   * Setup generator
   *
   * @param {string} wpath
   * @param {string} outpath
   * @returns {Generator}
   */
  init(wpath, outpath){
    const options = {
      recursive: this.config.overwrite,
    }

    fs.mkdirSync(this.outDir, options)

    const res = glob.sync(wpath, { cwd: this.templateDir, onlyFiles: true, dot: this.config.dot })

    for (const item of res){
      let dirname = path.dirname(item)
      let filename = path.basename(item)
      if (filename[0] === "_"){
        filename = filename.substr(1)
      }

      let newPath = path.join(outpath, dirname, filename)

      this.fileMap[item] = newPath
    }

    return this
  }

  /**
   * Walks through wpath and adds files to fileMap
   *
   * @param {string} wpath
   * @param {string} outpath
   */
  walk(wpath, outpath){
    const res = glob.sync(wpath, { cwd: this.templateDir, onlyFiles: true, dot: this.config.dot })
    const outIsFile = outpath.endsWith(path.sep)

    for (const item of res){
      let filename = path.basename(item)
      let newPath = outIsFile ? path.join(outpath, filename) : outpath

      this.fileMap[item] = newPath
    }
  }

  /**
   * Removes files described by wpath from fileMap
   *
   * @param {string} wpath
   */
  remove(wpath){
    const res = glob.sync(wpath, { cwd: this.templateDir, onlyFiles: true, dot: this.config.dot })
    for (const item of res){
      delete this.fileMap[item]
    }
  }

  /**
   * Map files in src with target folder in and store it in fileMap
   *
   * @param {string} src
   * @param {string} target
   * @returns {Generator}
   */
  add(src, target){
    this.walk(src, path.join(this.outDir, target))

    return this
  }

  /**
   * Remove files from fileMap
   *
   * @param {string} src
   * @returns {Generator}
   */
  ignore(src){
    this.remove(src)

    return this
  }

  /**
   * @param {Function} resolve
   */
  async then(resolve){
    const promises = []
    for (const src in this.fileMap){
      promises.push(
        evaluate(
          path.join(this.templateDir, src),
          this.fileMap[src],
          this.config.variables
        )
      )
    }

    await Promise.all(promises)
    resolve(this.fileMap)
  }
}

/**
 * Generates a project from the template
 *
 * Files with their name starting with _ (underscore)
 * can support ejs template and will get evaluated as an ejs file
 *
 * @param {string} templateDir - Path to the template directory
 * @param {string} outDir - Output directory
 * @param {Configuration} config - Map from variable to its value;
 *
 * @returns {Generator}
 */
module.exports = (
  templateDir,
  outDir,
  config = {
    overwrite: false,
    variables: {},
  }
) => {
  const generator = new Generator(templateDir, outDir, config)

  return generator
}
