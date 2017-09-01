'use strict';

const path = require('path');
const fs = require('fs');

const constants = require('../constants/index');

function getEnvOptions() {
  const options = {};

  for (let name in constants.ENVIRONMENT_CONFIG_MAP) {
    if (process.env[name]) {
      options[constants.ENVIRONMENT_CONFIG_MAP[name]] = process.env[name];
    }
  }

  return options;
}

function getAppOptions(pathToResolve) {
  const initialPath = pathToResolve;

  // Find nearest package.json by traversing up directories until /
  while(pathToResolve !== path.sep) {
    const pkgpath = path.join(pathToResolve, 'package.json');

    if (fs.existsSync(pkgpath)) {
      let options = (require(pkgpath) || {})['jest-junit'];

      if (Object.prototype.toString.call(options) !== '[object Object]') {
        options = {};
      }

      return options;
    } else {
      pathToResolve = path.dirname(pathToResolve);
    }
  }

  throw new Error(`Unable to locate package.json starting at ${initialPath}`);
}

module.exports = function () {
  return Object.assign({}, constants.DEFAULT_OPTIONS, getAppOptions(process.cwd()), getEnvOptions());
};
