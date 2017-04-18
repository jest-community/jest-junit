const buildJsonResults = require('../utils/buildJsonResults');
const constants = require('../constants/index');

describe('buildJsonResults', () => {
  it('should return the proper name from ancestorTitles when usePathForSuiteName is "false"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '', constants.DEFAULT_OPTIONS);

    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('foo');
  });

  it('should return the proper name from testFilePath when usePathForSuiteName is "true"; no appDirectory set', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '',
      Object.assign({}, constants.DEFAULT_OPTIONS, { usePathForSuiteName: "true" }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('/path/to/test/__tests__/foo.test.js');
  });

  it('should return the proper name from testFilePath when usePathForSuiteName is "true"; with appDirectory set', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/path/to/test',
      Object.assign({}, constants.DEFAULT_OPTIONS, { usePathForSuiteName: "true" }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('/__tests__/foo.test.js');
  });
});
