const fs = require('fs');
const path = require('path');

const makeDirRecursive = (pathToCreate) => {
  const dirs = pathToCreate.split(path.sep);

  let workingPath = '';

  while (dirs.length > 0 && fs.existsSync(pathToCreate) === false) {
    workingPath = path.join(workingPath, dirs.shift());

    if (fs.existsSync(workingPath) === false) {
      try {
        fs.mkdirSync(workingPath);
      } catch (e) {
      }
    }
  }

  return fs.existsSync(pathToCreate);
};

module.exports = {
  makeDirRecursive
};
