'use strict';

const fs = require('fs');
const libxmljs = require("libxmljs");
const path = require('path');

const testResultProcessor = require('../');

jest.mock('mkdirp', () => {
  return Object.assign(
    {},
    require.requireActual('mkdirp'),
    {
      sync: jest.fn()
    }
  )
});

jest.mock('fs', () => {
  return Object.assign(
    {},
    require.requireActual('fs'),
    {
      writeFileSync: jest.fn()
    }
  )
});

describe('jest-junit', () => {
  it('should generate valid xml', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const result = testResultProcessor(noFailingTestsReport);

    // Ensure fs.writeFileSync is called
    expect(fs.writeFileSync.mock.calls.length).toBe(1);

    // Ensure file would have been generated
    expect(fs.writeFileSync.mock.calls[0][0]).toBe(path.resolve('junit.xml'));

    // Ensure generated file is valid xml
    const xmlDoc = libxmljs.parseXml(fs.writeFileSync.mock.calls[0][1]);
    expect(xmlDoc).toBeTruthy();
  });
});
