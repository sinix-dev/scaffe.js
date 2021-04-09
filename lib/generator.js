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
  return new Promise((resolve, reject) => {
    fs.access(templateDir, (err) => {
      if (err) return reject(err);
    });

    const options = {
      recursive: config.overwrite,
    };

    fs.mkdir(outDir, options, (err) => {
      if (err) return reject(err);

      outDir = path.resolve(outDir);

      glob("**/*", { cwd: templateDir }, async (err, res) => {
        if (err) return reject(err);

        for (const file of res) {
          const filepath = path.join(templateDir, file);

          const newpath = path.join(outDir, file);
          const dirname = path.dirname(newpath);

          fs.mkdirSync(dirname, options);

          try {
            const isSuccessful = await evaluate(
              filepath,
              newpath,
              config.variables
            );
            if (!isSuccessful) {
              fs.copyFileSync(filepath, newpath);
            }
          } catch (err) {
            return reject(err);
          }
        }

        resolve();
      });
    });
  });
};
