// @ts-check

/**
 * Create a project from a template
 * @module generator
 */

/**
 * @typedef {object} Configuration
 * @property {boolean} overwrite - will overwrite the target directory if true, by default false
 * @property {object} variables - variables to be resolved in ejs template
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const evaluate = require("./eval.js");

class Generator {
  constructor(templateDir, outDir, config){
    this.templateDir = templateDir;
    this.outDir = outDir;
    this.config = config;
    this.fileMap = {};

    this.#init("**/*", outDir)
  }

  #init(wpath, outpath){
    const options = {
      recursive: this.config.overwrite
    };

    fs.mkdirSync(this.outDir, options);

    const res = glob.sync(wpath, { cwd: this.templateDir });

    for(const item of res){
      const stats = fs.lstatSync(path.join(this.templateDir, item));

      if(stats.isFile()){
        let dirname = path.dirname(item);
        let filename = path.basename(item);
        if(filename[0] === "_"){
          filename = filename.substr(1);
        }

        let newPath = path.join(outpath, dirname, filename);

        this.fileMap[item] = newPath;
      }
    }
  }

  #walk(wpath, outpath){
    const res = glob.sync(wpath, { cwd: this.templateDir });

    for(const item of res){
      const stats = fs.lstatSync(path.join(this.templateDir, item));

      if(stats.isFile()){
        let dirname = path.dirname(item);
        let filename = path.basename(item);
        let newPath = outpath;

        if(outpath[outpath.length - 1] === "/"){
          newPath = path.join(outpath, dirname, filename);
        }

        this.fileMap[item] = newPath;
      }
    }
  }

  #remove(wpath){
    const res = glob.sync(wpath, { cwd: this.templateDir });

    for(const item of res){
      const stats = fs.lstatSync(path.join(this.templateDir, item));

      if(stats.isFile()){
        delete this.fileMap[item]
      }
    }
  }

  add(src, target){
    this.#walk(src, path.join(this.outDir, target))

    return this;
  }

  ignore(src){
    this.#remove(src)

    return this;
  }

  async then(resolve, reject){
    const promises = [];

    for(const src in this.fileMap){
      promises.push(evaluate(path.join(this.templateDir, src), this.fileMap[src], this.config.variables));
    }

    await Promise.all(promises);
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
 * @returns {Promise<void>}
 */
module.exports = (
  templateDir,
  outDir,
  config = {
    overwrite: false,
    variables: {},
  }
) => {
  const generator = new Generator(templateDir, outDir, config);
  return generator;
};
