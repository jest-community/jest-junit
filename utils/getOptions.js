'use strict';

const path = require('path');

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

function getAppOptions() {
  let options = (require(path.join(process.cwd(), 'package.json')) || {})['jest-junit'];

  if (Object.prototype.toString.call(options) !== '[object Object]') {
    options = {};
  }

  return options;
}

module.exports = function () {
  return Object.assign({}, constants.DEFAULT_OPTIONS, getAppOptions(), getEnvOptions());
};
