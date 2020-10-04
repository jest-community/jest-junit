'use strict';

const buildJsonResults = require('../utils/buildJsonResults');
const constants = require('../constants/index');

let jsonResults;
let ignoreJunitErrors = false;

describe('buildJsonResults', () => {
  afterEach(() => {
    if (ignoreJunitErrors !== true) {
      // Verify each tests JSON output results in a
      // compliant junit.xml file based on __tests__/lib/junit.xsd (jenkins xsd)
      expect(jsonResults).toBeCompliantJUnit();
    }

    // Reset ignoreJunitErrors
    ignoreJunitErrors = false;
    jsonResults = undefined;
  });

  it('should contain number of tests in testSuite', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/', constants.DEFAULT_OPTIONS);

    expect(jsonResults.testsuites[1].testsuite[0]._attr.tests).toBe(1);
  });

  it('should contain number of tests in testSuites', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/', constants.DEFAULT_OPTIONS);

    expect(jsonResults.testsuites[0]._attr.tests).toBe(1);
  });

  it('should return the proper name from ancestorTitles when usePathForSuiteName is "false"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/', constants.DEFAULT_OPTIONS);

    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('foo');
  });

  it('should return the proper filename when suiteNameTemplate is "{filename}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        suiteNameTemplate: "{filename}"
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('foo.test.js');
  });

  it('should support suiteNameTemplate as function', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        suiteNameTemplate: (vars) => {
          return 'function called with vars: ' + Object.keys(vars).join(', ');
        }
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name)
      .toBe('function called with vars: filepath, filename, title, displayName');
  });

  it('should return the proper classname when classNameTemplate is "{classname}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          classNameTemplate: "{classname}"
        }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('foo baz');
  });

  it('should return the proper title when classNameTemplate is "{title}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          classNameTemplate: "{title}"
        }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('should bar');
  });

  it('should return the proper filepath when classNameTemplate is "{filepath}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          classNameTemplate: "{filepath}"
        }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('path/to/test/__tests__/foo.test.js');
  });

  it('should return the proper filename when classNameTemplate is "{filename}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        classNameTemplate: "{filename}"
      }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('foo.test.js');
  });

  it('should return the proper displayName when classNameTemplate is {displayName}', () => {
    const multiProjectNoFailingTestsReport = require('../__mocks__/multi-project-no-failing-tests.json');

    jsonResults = buildJsonResults(multiProjectNoFailingTestsReport, '/',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          classNameTemplate: "{displayName}"
        }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('project1');
  });

  it('should return the proper suitename when classNameTemplate is "{suitename}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          classNameTemplate: "{suitename}"
        }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('foo');
  });

  it('should support return the function result when classNameTemplate is a function', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        classNameTemplate: (vars) => {
          return 'function called with vars: ' + Object.keys(vars).join(', ');
        }
      }));
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname)
      .toBe('function called with vars: filepath, filename, suitename, classname, title, displayName');
  });

  it('should report no results as error', () => {
    const failingTestsReport = require('../__mocks__/failing-compilation.json');

    jsonResults = buildJsonResults(failingTestsReport, '/path/to/test',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          reportTestSuiteErrors: "true"
        }));

    const totals = jsonResults.testsuites[0]._attr;
    expect(totals.tests).toEqual(1);
    expect(totals.errors).toEqual(1);
    expect(totals.failures).toEqual(0);

    const suiteResult = jsonResults.testsuites[1].testsuite[0]._attr;
    expect(suiteResult.name).toEqual('../spec/test.spec.ts')
    expect(suiteResult.errors).toEqual(1);
    expect(suiteResult.tests).toEqual(0);

    const errorSuite = jsonResults.testsuites[1].testsuite[2];
    expect(errorSuite.testcase[0]._attr.name).toEqual(suiteResult.name);
    expect(errorSuite.testcase[0]._attr.classname).toEqual('Test suite failed to run');
    expect(errorSuite.testcase[1].error).toContain("Property 'hello' does not exist");

  });

  it('should report failureMessage if testExecErrorNotSet', () => {
    const failingTestsReport = require('../__mocks__/failing-import.json');

    jsonResults = buildJsonResults(failingTestsReport, '/path/to/test',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          reportTestSuiteErrors: "true"
        }));

    const errorSuite = jsonResults.testsuites[1].testsuite[2];
    expect(errorSuite.testcase[0]._attr.name).toEqual('../spec/test.spec.ts');
    expect(errorSuite.testcase[0]._attr.classname).toEqual('Test suite failed to run');
    expect(errorSuite.testcase[1].error).toContain("Cannot find module './mult'");
  });

  it('should report empty suites as error', () => {
    const failingTestsReport = require('../__mocks__/empty-suite.json');

    jsonResults = buildJsonResults(failingTestsReport, '/path/to/test',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          reportTestSuiteErrors: "true"
        }));

    const errorSuite = jsonResults.testsuites[1].testsuite[2];
    expect(errorSuite.testcase[0]._attr.name).toEqual('../spec/test.spec.ts');
    expect(errorSuite.testcase[0]._attr.classname).toEqual('Test suite failed to run');
    expect(errorSuite.testcase[1].error).toContain("Your test suite must contain at least one test");
  });

  it('should honor templates when test has errors', () => {
    const failingTestsReport = require('../__mocks__/failing-compilation.json');

    jsonResults = buildJsonResults(failingTestsReport, '/path/to/test',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          reportTestSuiteErrors: "true",
          suiteNameTemplate: "{displayName}-foo",
          titleTemplate: "{title}-bar"
        }));

    expect(jsonResults.testsuites[2].testsuite[2].testcase[0]._attr.name).toEqual('should foo-bar');
  });

  it('should return the proper filepath when titleTemplate is "{filepath}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        titleTemplate: "{filepath}"
      }));
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.name).toBe('path/to/test/__tests__/foo.test.js');
  });

  it('should return the proper filepath when suiteNameTemplate is "{filepath}" and usePathForSuiteName is "false"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        suiteNameTemplate: "{filepath}"
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('path/to/test/__tests__/foo.test.js');
  });

  it('should return the proper name from ancestorTitles when suiteNameTemplate is set to "{title}" and usePathForSuiteName is "true"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        usePathForSuiteName: "true"
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('path/to/test/__tests__/foo.test.js');
  });

  it('should return the proper name from testFilePath when usePathForSuiteName is "true"; no appDirectory set', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        usePathForSuiteName: "true"
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('path/to/test/__tests__/foo.test.js');
  });

  it('should return the proper name from testFilePath when usePathForSuiteName is "true"; with appDirectory set', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/path/to/test',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        usePathForSuiteName: "true"
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('__tests__/foo.test.js');
  });

  it('should return the proper classname when ancestorSeparator is default', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS));
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('foo baz should bar');
  });

  it('should return the proper classname when ancestorSeparator is customized', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        ancestorSeparator: " › "
      }));
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('foo › baz should bar');
  });

  it('should parse failure messages for failing tests', () => {
    const failingTestsReport = require('../__mocks__/failing-tests.json');
    jsonResults = buildJsonResults(failingTestsReport, '/path/to/test', constants.DEFAULT_OPTIONS);

    const failureMsg = jsonResults.testsuites[1].testsuite[2].testcase[1].failure;

    // Make sure no escape codes are there that exist in the mock
    expect(failureMsg.includes('\u001b')).toBe(false);

  });

  it('should support displayName template var for jest multi-project', () => {
    const multiProjectNoFailingTestsReport = require('../__mocks__/multi-project-no-failing-tests.json');

    // Mock Date.now() to return a fixed later value
    const startDate = new Date(multiProjectNoFailingTestsReport.startTime);
    spyOn(Date, 'now').and.returnValue(startDate.getTime() + 1234);

    jsonResults = buildJsonResults(multiProjectNoFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        suiteNameTemplate: "{displayName}-foo",
        titleTemplate: "{displayName}-bar"
      }));

    expect(jsonResults).toMatchSnapshot();
  });

  it('should not return the file name by default', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/', constants.DEFAULT_OPTIONS);
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.file).toBe(undefined);
  });

  it('should return the file name when addFileAttribute is "true"', () => {
    // Ignore junit errors for this attribute
    // It is added for circle-ci and is known to not generate
    // jenkins-compatible junit
    ignoreJunitErrors = true;

    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        addFileAttribute: "true"
      }));
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.file).toBe('path/to/test/__tests__/foo.test.js');
  });

  it('should show output of console if includeConsoleOutput is true', () => {
    const reportWithConsoleOutput = require('../__mocks__/test-with-console-output.json');
    jsonResults = buildJsonResults(reportWithConsoleOutput, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        includeConsoleOutput: "true"
      }));

    expect(jsonResults.testsuites[1].testsuite[3]['system-out']).toBeDefined();
  });

  it('should NOT show output of console if includeConsoleOutput is not set or false', () => {
    const reportWithConsoleOutput = require('../__mocks__/test-with-console-output.json');
    jsonResults = buildJsonResults(reportWithConsoleOutput, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        includeConsoleOutput: "false"
      }));

    expect(jsonResults.testsuites[1].testsuite[1]['system-out']).not.toBeDefined();
  });

  it('should show short console output if includeShortConsoleOutput is true', () => {
    const reportWithShortConsoleOutput = require('../__mocks__/test-with-console-output.json');
    jsonResults = buildJsonResults(reportWithShortConsoleOutput, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        includeShortConsoleOutput: "true"
      }));

    expect(jsonResults.testsuites[1].testsuite[3]['system-out']._cdata).toEqual("[\n  \"I am bar\",\n  \"Some output here from a lib\"\n]");
  });

  it('should NOT show short console output if includeShortConsoleOutput is not set or false', () => {
    const reportWithShortConsoleOutput = require('../__mocks__/test-with-console-output.json');
    jsonResults = buildJsonResults(reportWithShortConsoleOutput, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        includeShortConsoleOutput: "false"
      }));

    expect(jsonResults.testsuites[1].testsuite[2]['system-out']).not.toBeDefined();
  });
});
