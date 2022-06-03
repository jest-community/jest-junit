const fs = require('fs');
const path = require('path');

const getOptions = require('../utils/getOptions.js');


const rootPath = path.parse(process.cwd()).root
const rootPackageJsonMock = path.join(rootPath, "package.json");

const mockPackageJson = {
  name: 'foo',
  version: '1.0.0',
  'jest-junit': {
    suiteName: 'test suite'
  }
}

jest.mock('fs', () => {
  return Object.assign(
    {},
    jest.requireActual('fs'),
    {
      existsSync: jest.fn().mockReturnValue(true)
    }
  )
});

// Mock return of require('/package.json')
// Virtual because it doesn't actually exist
jest.doMock(rootPackageJsonMock, () => {
  return mockPackageJson
}, {virtual: true});

describe('getOptions', () => {
  it ('should support package.json in root directory', () => {
    const options = getOptions.getAppOptions(rootPath)
    expect(options).toBe(mockPackageJson['jest-junit'])
  });
});

describe('getUniqueOutputName', () =>{
  const defaultPrefix = 'junit'

  it(`should return default ${defaultPrefix} value if given no preferred prefix`, () => {
    const uniqueOutput = getOptions.getUniqueOutputName()
    expect(uniqueOutput).toContain(defaultPrefix)
  })

  it(`should return apply custom prefix value if given prefix`, () => {
    const customPrefix = "foo"
    const uniqueOutput = getOptions.getUniqueOutputName(customPrefix)
    expect(uniqueOutput).not.toContain(defaultPrefix)
    expect(uniqueOutput).toContain(customPrefix)
  })

})

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
