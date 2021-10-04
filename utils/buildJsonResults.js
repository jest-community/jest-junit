'use strict';

const stripAnsi = require('strip-ansi');
const constants = require('../constants/index');
const path = require('path');
const fs = require('fs');

// Wrap the varName with template tags
const toTemplateTag = function (varName) {
  return "{" + varName + "}";
}

// Replaces var using a template string or a function.
// When strOrFunc is a template string replaces {varname} with the value from the variables map.
// When strOrFunc is a function it returns the result of the function to which the variables are passed.
const replaceVars = function (strOrFunc, variables) {
  if (typeof strOrFunc === 'string') {
    let str = strOrFunc;
    Object.keys(variables).forEach((varName) => {
      str = str.replace(toTemplateTag(varName), variables[varName]);
    });
    return str;
  } else {
    const func = strOrFunc;
    const resolvedStr = func(variables);
    if (typeof resolvedStr !== 'string') {
      throw new Error('Template function should return a string');
    }
    return resolvedStr;
  }
};

const executionTime = function (startTime, endTime) {
  return (endTime - startTime) / 1000;
}

const addErrorTestResult = function (suite) {
  suite.testResults.push({
    "ancestorTitles": [],
    "duration": 0,
    "failureMessages": [
      suite.failureMessage
    ],
    "numPassingAsserts": 0,
    "status": "error"
  })
}

module.exports = function (report, appDirectory, options) {
  // Check if there is a junitProperties.js (or whatever they called it)
  const junitSuitePropertiesFilePath = path.join(process.cwd(), options.testSuitePropertiesFile);
  let ignoreSuitePropertiesCheck = !fs.existsSync(junitSuitePropertiesFilePath);

  // If the usePathForSuiteName option is true and the
  // suiteNameTemplate value is set to the default, overrides
  // the suiteNameTemplate.
  if (options.usePathForSuiteName === 'true' &&
      options.suiteNameTemplate === toTemplateTag(constants.TITLE_VAR)) {

    options.suiteNameTemplate = toTemplateTag(constants.FILEPATH_VAR);
  }

  // Generate a single XML file for all jest tests
  let jsonResults = {
    'testsuites': [{
      '_attr': {
        'name': options.suiteName,
        'tests': 0,
        'failures': 0,
        'errors': 0,
        // Overall execution time:
        // Since tests are typically executed in parallel this time can be significantly smaller
        // than the sum of the individual test suites
        'time': executionTime(report.startTime, Date.now())
      }
    }]
  };

  // Iterate through outer testResults (test suites)
  report.testResults.forEach((suite) => {
    const noResults = suite.testResults.length === 0;
    if (noResults && options.reportTestSuiteErrors === 'false') {
      return;
    }

    const noResultOptions = noResults ? {
      suiteNameTemplate: toTemplateTag(constants.FILEPATH_VAR),
      titleTemplate: toTemplateTag(constants.FILEPATH_VAR),
      classNameTemplate: `Test suite failed to run`
    } : {};

    const suiteOptions = Object.assign({}, options, noResultOptions);
    if (noResults) {
      addErrorTestResult(suite);
    }

    // Build variables for suite name
    const filepath = path.relative(appDirectory, suite.testFilePath);
    const filename = path.basename(filepath);
    const suiteTitle = suite.testResults[0].ancestorTitles[0];
    const displayName = typeof suite.displayName === 'object'
      ? suite.displayName.name
      : suite.displayName;

    // Build replacement map
    let suiteNameVariables = {};
    suiteNameVariables[constants.FILEPATH_VAR] = filepath;
    suiteNameVariables[constants.FILENAME_VAR] = filename;
    suiteNameVariables[constants.TITLE_VAR] = suiteTitle;
    suiteNameVariables[constants.DISPLAY_NAME_VAR] = displayName;

    // Add <testsuite /> properties
    const suiteNumTests = suite.numFailingTests + suite.numPassingTests + suite.numPendingTests;
    const suiteExecutionTime = executionTime(suite.perfStats.start, suite.perfStats.end);

    const suiteErrors = noResults ? 1 : 0;
    let testSuite = {
      'testsuite': [{
        _attr: {
          name: replaceVars(suiteOptions.suiteNameTemplate, suiteNameVariables),
          errors: suiteErrors,
          failures: suite.numFailingTests,
          skipped: suite.numPendingTests,
          timestamp: (new Date(suite.perfStats.start)).toISOString().slice(0, -5),
          time: suiteExecutionTime,
          tests: suiteNumTests
        }
      }]
    };

    // Update top level testsuites properties
    jsonResults.testsuites[0]._attr.failures += suite.numFailingTests;
    jsonResults.testsuites[0]._attr.errors += suiteErrors;
    jsonResults.testsuites[0]._attr.tests += suiteNumTests;

    if (!ignoreSuitePropertiesCheck) {
      let junitSuiteProperties = require(junitSuitePropertiesFilePath)(suite);

      // Add any test suite properties
      let testSuitePropertyMain = {
        'properties': []
      };

      Object.keys(junitSuiteProperties).forEach((p) => {
        let testSuiteProperty = {
          'property': {
            _attr: {
              name: p,
              value: replaceVars(junitSuiteProperties[p], suiteNameVariables)
            }
          }
        };

        testSuitePropertyMain.properties.push(testSuiteProperty);
      });

      testSuite.testsuite.push(testSuitePropertyMain);
    }

    // Iterate through test cases
    suite.testResults.forEach((tc) => {
      const classname = tc.ancestorTitles.join(suiteOptions.ancestorSeparator);
      const testTitle = tc.title;

      // Build replacement map
      let testVariables = {};
      testVariables[constants.FILEPATH_VAR] = filepath;
      testVariables[constants.FILENAME_VAR] = filename;
      testVariables[constants.SUITENAME_VAR] = suiteTitle;
      testVariables[constants.CLASSNAME_VAR] = classname;
      testVariables[constants.TITLE_VAR] = testTitle;
      testVariables[constants.DISPLAY_NAME_VAR] = displayName;

      let testCase = {
        'testcase': [{
          _attr: {
            classname: replaceVars(suiteOptions.classNameTemplate, testVariables),
            name: replaceVars(suiteOptions.titleTemplate, testVariables),
            time: tc.duration / 1000
          }
        }]
      };

      if (suiteOptions.addFileAttribute === 'true') {
        testCase.testcase[0]._attr.file = filepath;
      }

      // Write out all failure messages as <failure> tags
      // Nested underneath <testcase> tag
      if (tc.status === 'failed'|| tc.status === 'error') {
        const failureMessages = options.noStackTrace === 'true' && tc.failureDetails ?
            tc.failureDetails.map(detail => detail.message) : tc.failureMessages;

        failureMessages.forEach((failure) => {
          const tagName = tc.status === 'failed' ? 'failure': 'error'
          testCase.testcase.push({
            [tagName]: stripAnsi(failure)
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

    // Write stdout console output if available
    if (suiteOptions.includeConsoleOutput === 'true' && suite.console && suite.console.length) {
      // Stringify the entire console object
      // Easier this way because formatting in a readable way is tough with XML
      // And this can be parsed more easily
      let testSuiteConsole = {
        'system-out': {
          _cdata: JSON.stringify(suite.console, null, 2)
        }
      };

      testSuite.testsuite.push(testSuiteConsole);
    }

    // Write short stdout console output if available
    if (suiteOptions.includeShortConsoleOutput === 'true' && suite.console && suite.console.length) {
      // Extract and then Stringify the console message value
      // Easier this way because formatting in a readable way is tough with XML
      // And this can be parsed more easily
      let testSuiteConsole = {
        'system-out': {
          _cdata: JSON.stringify(suite.console.map(item => item.message), null, 2)
        }
      };

      testSuite.testsuite.push(testSuiteConsole);
    }

    jsonResults.testsuites.push(testSuite);
  });

  return jsonResults;
};
