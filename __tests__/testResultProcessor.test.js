'use strict';

jest.mock('mkdirp', () => {
  return Object.assign(
    {},
    jest.requireActual('mkdirp'),
    {
      sync: jest.fn()
    }
  )
});

jest.mock('fs', () => {
  return Object.assign(
    {},
    jest.requireActual('fs'),
    {
      writeFileSync: jest.fn()
    }
  )
});

const fs = require('fs');
const libxmljs = require('libxmljs');
const path = require('path');

const testResultProcessor = require('../');

describe('jest-junit', () => {

  afterEach(() => jest.clearAllMocks())

  it('should generate valid xml with default name', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    testResultProcessor(noFailingTestsReport);

    // Ensure fs.writeFileSync is called
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);

    // Ensure file would have been generated
    expect(fs.writeFileSync).toHaveBeenLastCalledWith(path.resolve('junit.xml'), expect.any(String));

    // Ensure generated file is valid xml
    const xmlDoc = libxmljs.parseXml(fs.writeFileSync.mock.calls[0][1]);
    expect(xmlDoc).toBeTruthy();
  });

  it('should generate valid xml with unique name', () => {
    process.env.JEST_JUNIT_UNIQUE_OUTPUT_NAME = 'true'
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    testResultProcessor(noFailingTestsReport);

    // Ensure fs.writeFileSync is called
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);

    // Ensure file would have been generated
    expect(fs.writeFileSync).toHaveBeenLastCalledWith(expect.stringMatching(/junit-\S+\.xml/), expect.any(String));

    // Ensure generated file is valid xml
    const xmlDoc = libxmljs.parseXml(fs.writeFileSync.mock.calls[0][1]);
    expect(xmlDoc).toBeTruthy();
  });


  it('should generate xml at the output filepath defined by JEST_JUNIT_OUTPUT_FILE', () => {
    process.env.JEST_JUNIT_OUTPUT_FILE = 'path_to_output/output_name.xml'
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    testResultProcessor(noFailingTestsReport);

    // Ensure fs.writeFileSync is called
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);

    // Ensure file would have been generated
    expect(fs.writeFileSync).toHaveBeenLastCalledWith(
      expect.stringMatching(/path_to_output\S+\output_name.xml/), expect.any(String)
    );
  });

  it('should generate xml at the output filepath defined by outputFile config', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    testResultProcessor(noFailingTestsReport, {outputFile: 'path_to_output/output_name.xml' });

    // Ensure fs.writeFileSync is called
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);

    // Ensure file would have been generated
    expect(fs.writeFileSync).toHaveBeenLastCalledWith(
      expect.stringMatching(/path_to_output\S+\output_name.xml/), expect.any(String)
    );
  });
});
