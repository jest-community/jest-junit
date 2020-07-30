'use strict';

const buildJsonResults = require('../utils/buildJsonResults');
const constants = require('../constants/index');

// Extend expect so we can test generated xml will be valid to the jenkins
// junit spec
const xml = require('xml');
const path = require('path');
const fs = require('fs');
const libxmljs = require('libxmljs');

const schemaPath = path.join(process.cwd(), '__tests__', 'lib', 'junit.xsd');
const schemaStr = fs.readFileSync(schemaPath);
const schema = libxmljs.parseXmlString(schemaStr);

global.expect.extend({
  toConvertToXmlAndPassXsd(jsonResults) {
    const xmlStr = xml(jsonResults, { indent: '  '});

    const libxmljsObj = libxmljs.parseXmlString(xmlStr);
    const isValid = libxmljsObj.validate(schema);

    if (!isValid) {
      return {
        message: () => {
          return `
            ${libxmljsObj.validationErrors.join('\n')}
            ======= XML OUTPUT =======
            ${xmlStr}
          `;
        },
        pass: false
      }
    } else {
      return {
        message: () => `expected not to validate against junit xsd`,
        pass: true
      }
    }
  }
});

describe('buildJsonResults', () => {
  it('should contain number of tests in testSuite', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/', constants.DEFAULT_OPTIONS);

    expect(jsonResults.testsuites[1].testsuite[0]._attr.tests).toBe(1);

    // Test that generated xml from json results passes jenkins junit xsd
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should contain number of tests in testSuites', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/', constants.DEFAULT_OPTIONS);

    expect(jsonResults.testsuites[0]._attr.tests).toBe(1);
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper name from ancestorTitles when usePathForSuiteName is "false"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/', constants.DEFAULT_OPTIONS);

    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('foo');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper filename when suiteNameTemplate is "{filename}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        suiteNameTemplate: "{filename}"
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('foo.test.js');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should support suiteNameTemplate as function', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        suiteNameTemplate: (vars) => {
          return 'function called with vars: ' + Object.keys(vars).join(', ');
        }
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name)
      .toBe('function called with vars: filepath, filename, title, displayName');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper classname when classNameTemplate is "{classname}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          classNameTemplate: "{classname}"
        }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('foo baz');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper title when classNameTemplate is "{title}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          classNameTemplate: "{title}"
        }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('should bar');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper filepath when classNameTemplate is "{filepath}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          classNameTemplate: "{filepath}"
        }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('path/to/test/__tests__/foo.test.js');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper filename when classNameTemplate is "{filename}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        classNameTemplate: "{filename}"
      }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('foo.test.js');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper displayName when classNameTemplate is {displayName}', () => {
    const multiProjectNoFailingTestsReport = require('../__mocks__/multi-project-no-failing-tests.json');

    const jsonResults = buildJsonResults(multiProjectNoFailingTestsReport, '/',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          classNameTemplate: "{displayName}"
        }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('project1');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper suitename when classNameTemplate is "{suitename}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
        Object.assign({}, constants.DEFAULT_OPTIONS, {
          classNameTemplate: "{suitename}"
        }));

    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('foo');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should support return the function result when classNameTemplate is a function', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        classNameTemplate: (vars) => {
          return 'function called with vars: ' + Object.keys(vars).join(', ');
        }
      }));
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname)
      .toBe('function called with vars: filepath, filename, suitename, classname, title, displayName');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper filepath when titleTemplate is "{filepath}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        titleTemplate: "{filepath}"
      }));
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.name).toBe('path/to/test/__tests__/foo.test.js');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper filepath when suiteNameTemplate is "{filepath}" and usePathForSuiteName is "false"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        suiteNameTemplate: "{filepath}"
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('path/to/test/__tests__/foo.test.js');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper name from ancestorTitles when suiteNameTemplate is set to "{title}" and usePathForSuiteName is "true"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        usePathForSuiteName: "true"
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('path/to/test/__tests__/foo.test.js');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper name from testFilePath when usePathForSuiteName is "true"; no appDirectory set', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        usePathForSuiteName: "true"
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('path/to/test/__tests__/foo.test.js');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper name from testFilePath when usePathForSuiteName is "true"; with appDirectory set', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/path/to/test',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        usePathForSuiteName: "true"
      }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('__tests__/foo.test.js');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper classname when ancestorSeparator is default', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS));
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('foo baz should bar');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper classname when ancestorSeparator is customized', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        ancestorSeparator: " › "
      }));
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.classname).toBe('foo › baz should bar');
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should parse failure messages for failing tests', () => {
    const failingTestsReport = require('../__mocks__/failing-tests.json');
    const jsonResults = buildJsonResults(failingTestsReport, '/path/to/test', constants.DEFAULT_OPTIONS);

    const failureMsg = jsonResults.testsuites[1].testsuite[2].testcase[1].failure;

    // Make sure no escape codes are there that exist in the mock
    expect(failureMsg.includes('\u001b')).toBe(false);
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should support displayName template var for jest multi-project', () => {
    const multiProjectNoFailingTestsReport = require('../__mocks__/multi-project-no-failing-tests.json');

    // Mock Date.now() to return a fixed later value
    const startDate = new Date(multiProjectNoFailingTestsReport.startTime);
    spyOn(Date, 'now').and.returnValue(startDate.getTime() + 1234);

    const jsonResults = buildJsonResults(multiProjectNoFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        suiteNameTemplate: "{displayName}-foo",
        titleTemplate: "{displayName}-foo"
      }));

    expect(jsonResults).toMatchSnapshot();
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should not return the file name by default', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/', constants.DEFAULT_OPTIONS);
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.file).toBe(undefined);
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the file name when addFileAttribute is "true"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        addFileAttribute: "true"
      }));
    expect(jsonResults.testsuites[1].testsuite[2].testcase[0]._attr.file).toBe('path/to/test/__tests__/foo.test.js');
    // Generates unsupported junit according to jenkins xsd
    // But we keep it for those that use CircleCI
    //expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should show output of console if includeConsoleOutput is true', () => {
    const reportWithConsoleOutput = require('../__mocks__/test-with-console-output.json');
    const jsonResults = buildJsonResults(reportWithConsoleOutput, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        includeConsoleOutput: "true"
      }));

    expect(jsonResults.testsuites[1].testsuite[2]['testcase'][1]['system-out']).toBeDefined();
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should NOT show output of console if includeConsoleOutput is not set or false', () => {
    const reportWithConsoleOutput = require('../__mocks__/test-with-console-output.json');
    const jsonResults = buildJsonResults(reportWithConsoleOutput, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        includeConsoleOutput: "false"
      }));

    expect(jsonResults.testsuites[1].testsuite[2]['testcase'][1]).not.toBeDefined();
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should show short console output if includeShortConsoleOutput is true', () => {
    const reportWithShortConsoleOutput = require('../__mocks__/test-with-console-output.json');
    const jsonResults = buildJsonResults(reportWithShortConsoleOutput, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        includeShortConsoleOutput: "true"
      }));

    expect(jsonResults.testsuites[1].testsuite[2]['testcase'][1]['system-out']._cdata).toEqual("[\n  \"I am bar\",\n  \"Some output here from a lib\"\n]");
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should NOT show short console output if includeShortConsoleOutput is not set or false', () => {
    const reportWithShortConsoleOutput = require('../__mocks__/test-with-console-output.json');
    const jsonResults = buildJsonResults(reportWithShortConsoleOutput, '/',
      Object.assign({}, constants.DEFAULT_OPTIONS, {
        includeShortConsoleOutput: "false"
      }));

    expect(jsonResults.testsuites[1].testsuite[2]['system-out']).not.toBeDefined();
    expect(jsonResults).toConvertToXmlAndPassXsd();
  });
});
