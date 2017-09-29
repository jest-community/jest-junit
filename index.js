'use strict';

const xml = require('xml');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');

const buildJsonResults = require('./utils/buildJsonResults');
const getOptions = require('./utils/getOptions');

/*
  At the end of ALL of the test suites this method is called
  It's responsible for generating a single junit.xml file which
  Represents the status of the test runs

  Expected input and workflow documentation here:
  https://facebook.github.io/jest/docs/configuration.html#testresultsprocessor-string

  Intended output (junit XML) documentation here:
  http://help.catchsoftware.com/display/ET/JUnit+Format
*/
module.exports = (report) => {
  const options = getOptions.options();
  const jsonResults = buildJsonResults(report, fs.realpathSync(process.cwd()), options);

  // Ensure output path exists
  mkdirp.sync(path.dirname(options.output));

  // Write data to file
  fs.writeFileSync(options.output, xml(jsonResults, { indent: '  '}));

  // Jest 18 compatibility
  return report;
};
