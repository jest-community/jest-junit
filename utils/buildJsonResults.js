'use strict';

const stripAnsi = require('strip-ansi');
const constants = require('../constants/index');

const replaceVars = function (str, classname, title) {
  return str
    .replace(constants.CLASSNAME_VAR, classname)
    .replace(constants.TITLE_VAR, title);
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

    // Add <testsuite /> properties
    let testSuite = {
      'testsuite': [{
        _attr: {
          name: options.usePathForSuiteName === "true" ?
              suite.testFilePath.replace(appDirectory, '') :
              suite.testResults[0].ancestorTitles[0],
          tests: suite.numFailingTests + suite.numPassingTests + suite.numPendingTests,
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
      const title = tc.title;

      let testCase = {
        'testcase': [{
          _attr: {
            classname: replaceVars(options.classNameTemplate, classname, title),
            name: replaceVars(options.titleTemplate, classname, title),
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
