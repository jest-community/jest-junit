'use strict';

const xml = require('xml');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');

const SUITE_NAME = process.env.JEST_SUITE_NAME || 'jest tests';
const OUTPUT_PATH = process.env.JEST_JUNIT_OUTPUT ||
                    path.join(process.cwd(), './junit.xml');

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
  // Generate a single XML file for all jest tests
  let jsonResults = {
    'testsuites': [
      {
        '_attr': {
          'name': SUITE_NAME
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
          name: suite.testResults[0].ancestorTitles[0],
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
      let testCase = {
        'testcase': [{
          _attr: {
            classname: tc.ancestorTitles.join(' '),
            name: tc.title,
            time: tc.duration / 1000
          }
        }]
      };

      // Write out all failure messages as <failure> tags
      // Nested underneath <testcase> tag
      if (tc.status === 'failed') {
        tc.failureMessages.forEach((failure) => {
          testCase.testcase.push({
            'failure': [{
              _attr: {
                message: failure || ''
              }
            }]
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

  // Ensure output path exists
  mkdirp.sync(path.dirname(OUTPUT_PATH));

  // Write data to file
  fs.writeFileSync(OUTPUT_PATH, xml(jsonResults, { indent: '  '}));

  // Jest 18 compatibility
  return report;
};
