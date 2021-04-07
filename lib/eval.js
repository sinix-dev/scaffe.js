const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

/**
 * Process only ejs files and copies to newpath
 * returns true if not an ejs file or file doesn't exist.
 *
 * @param {string} filepath
 * @param {string} newpath
 * @param {object} values - variables
 *
 * @return {boolean} - whether it needs to be evaluated or not
 */
module.exports = (filepath, newpath, values) => {
  const filename = path.basename(filepath);

  if (fs.existsSync(filepath) && fs.lstatSync(filepath).isDirectory()) {
    return false;
  }

  if (filename[0] === "_") {
    const content = fs.readFileSync(filepath);
    const eval_content = ejs.render(content.toString(), values);

    newpath = path.join(path.dirname(newpath), filename.substr(1));

    fs.writeFileSync(newpath, eval_content);

    return false;
  }

  return true;
};
