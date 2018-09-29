const fs = require('fs');
const path = require('path');

const getOptions = require('../utils/getOptions.js');

jest.mock('fs', () => {
  return Object.assign(
    {},
    require.requireActual('fs'),
    {
      existsSync: jest.fn().mockReturnValue(true)
    }
  )
});

// Mock return of require('/package.json')
// Virtual because it doesn't actually exist
jest.mock('/package.json', () => {
  return {
    name: 'foo',
    version: '1.0.0',
    'jest-junit': {
      suiteName: 'test suite'
    }
  }
}, {virtual: true});

describe('getOptions', () => {
  it ('should support package.json in /', () => {

  });
});

describe('replace <rootDir>', () => {
  it('should replace <rootDir> in output path', () => {
    const rootDir = 'testRootDir';
    const outputPath = '<rootDir>/test/result/output.xml';

    const newOutput = getOptions.replaceRootDirInOutput(rootDir, outputPath);

    // Result of replaceRootDirInOutput will also contain the drive letter and path slashes (different format depending on OS).
    // So instead assert that the rootDir is in the result and the placeholder (<rootDir>) is not.
    expect(newOutput).toContain(rootDir);
    expect(newOutput).not.toContain('<rootDir>');
  });

  it('should not replace when output has no <rootDir>', () => {
    const rootDir = 'testRootDir';
    const outputPath = 'testDir/test/result/output.xml';

    const newOutput = getOptions.replaceRootDirInOutput(rootDir, outputPath);

    expect(newOutput).toBe(outputPath);
  });

  it('should not replace when rootDir is null', () => {
    const outputPath = 'testDir/test/result/output.xml';

    const newOutput = getOptions.replaceRootDirInOutput(null, outputPath);

    expect(newOutput).toBe(outputPath);
  });
});
