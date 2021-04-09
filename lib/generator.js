const fs = require("fs");
const path = require("path");
const glob = require("glob");
const evaluate = require("./eval.js");

/**
 * Generates a project from the template
 *
 * Files with their name starting with _ (underscore)
 * can support ejs template and will get evaluated as an ejs file
 * @param {string} templateDir - Path to the template directory
 * @param {string} outDir - Output directory
 * @param {object} values - Map from variable to it's value
 *
 * @returns {Promise<void>}
 */
module.exports = (templateDir, outDir, values) => {
  return new Promise((resolve, reject) => {
    fs.access(templateDir, (err) => {
      if (err) return reject(err);
    });

    fs.mkdir(outDir, (err) => {
      if (err) return reject(err);

      outDir = path.resolve(outDir);

      glob("**/*", { cwd: templateDir }, (err, res) => {
        if (err) return reject(err);

        for (file of res) {
          const filepath = path.join(templateDir, file);

          newpath = path.join(outDir, file);
          dirname = path.dirname(newpath);

          fs.mkdirSync(dirname, { recursive: true });

          if (evaluate(filepath, newpath, values)) {
            try {
              fs.copyFileSync(filepath, newpath);
            } catch (err) {
              reject(err);
            }
          }
        }

        resolve();
      });
    });
  });
};
