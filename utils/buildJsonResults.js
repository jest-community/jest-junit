'use strict';

const stripAnsi = require('strip-ansi');
const constants = require('../constants/index');
const path = require('path');

// Takes a string and a Map of 'tag' values to replacement values
const replaceVars = function (str, replacementMap) {
  Object.keys(replacementMap).forEach((key) => {
    str = str.replace(key, replacementMap[key]);
  });

  return str;
};

module.exports = function (report, appDirectory, options) {
  // Generate a single XML file for all jest tests
  let jsonResults = {
    'testsuites': [
      {
        '_attr': {
          'name': options.suiteName
        }
      }
    ]
  };

  // Iterate through outer testResults (test suites)
  report.testResults.forEach((suite) => {
    // Skip empty test suites
    if (suite.testResults.length <= 0) {
      return;
    }

    // If the usePathForSuiteName option is true and the
    // suiteNameTemplate value is set to the default, overrides
    // the suiteNameTemplate.
    if(options.usePathForSuiteName === 'true'
      && options.suiteNameTemplate === constants.TITLE_VAR) {

      options.suiteNameTemplate = constants.FILEPATH_VAR;
    }

    // Build variables for suite name
    const filepath = suite.testFilePath.replace(appDirectory, '');
    const filename = path.basename(filepath);
    const suiteTitle = suite.testResults[0].ancestorTitles[0];

    // Build replacement map
    let suiteReplacementMap = {};
    suiteReplacementMap[constants.FILEPATH_VAR] = filepath;
    suiteReplacementMap[constants.FILENAME_VAR] = filename;
    suiteReplacementMap[constants.TITLE_VAR] = suiteTitle;

    // Add <testsuite /> properties
    let testSuite = {
      'testsuite': [{
        _attr: {
          name: replaceVars(options.suiteNameTemplate, suiteReplacementMap),
          errors: 0,  // not supported
          failures: suite.numFailingTests,
          skipped: suite.numPendingTests,
          timestamp: (new Date(suite.perfStats.start)).toISOString().slice(0, -5),
          time: (suite.perfStats.end - suite.perfStats.start) / 1000
        }
      }]
    };

    // Iterate through test cases
    suite.testResults.forEach((tc) => {
      const classname = tc.ancestorTitles.join(options.ancestorSeparator);
      const testTitle = tc.title;

      // Build replacement map
      let testReplacementMap = {};
      testReplacementMap[constants.CLASSNAME_VAR] = classname;
      testReplacementMap[constants.TITLE_VAR] = testTitle;

      let testCase = {
        'testcase': [{
          _attr: {
            classname: replaceVars(options.classNameTemplate, testReplacementMap),
            name: replaceVars(options.titleTemplate, testReplacementMap),
            time: tc.duration / 1000
          }
        }]
      };

      // Write out all failure messages as <failure> tags
      // Nested underneath <testcase> tag
      if (tc.status === 'failed') {
        tc.failureMessages.forEach((failure) => {
          testCase.testcase.push({
            'failure': stripAnsi(failure)
          });
        })
      }

      // Write out a <skipped> tag if test is skipped
      // Nested underneath <testcase> tag
      if (tc.status === 'pending') {
        testCase.testcase.push({
          skipped: {}
        });
      }

      testSuite.testsuite.push(testCase);
    });

    jsonResults.testsuites.push(testSuite);
  });

  return jsonResults;
};
