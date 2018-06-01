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

  let traversing = true;

  // Find nearest package.json by traversing up directories until /
  while(traversing) {
    traversing = pathToResolve !== path.sep;

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

  return {};
}

module.exports = {
  options: (reporterOptions = {}) => {
    return Object.assign({}, constants.DEFAULT_OPTIONS, reporterOptions, getAppOptions(process.cwd()), getEnvOptions());
  },
  getAppOptions: getAppOptions,
  getEnvOptions: getEnvOptions
};
