const fs = require('fs');
const path = require('path');

const makeDirRecursive = (pathToCreate) => {
  try {
    path.parse(pathToCreate);
  } catch (e) {
    return false;
  }

  const dirs = pathToCreate.split(path.sep);

  let workingPath = '';

  while (dirs.length > 0 && !fs.existsSync(pathToCreate)) {
    workingPath = path.join(workingPath, dirs.shift());

    if (!fs.existsSync(pathToCreate)) {
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
