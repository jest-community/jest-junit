const path = require('path');
const getTestSuitePropertiesPath = require('../utils/getTestSuitePropertiesPath');

jest.mock('path', () => {
  return {
    ...jest.requireActual('path'),
    join: (...paths) => {
      return paths.join('/');
    },
    resolve: (...paths) => {
      return `/absolute/${paths.join('/')}`
    }
  };
});

const options = {
  testSuitePropertiesFile: 'properties.js',
  testSuitePropertiesDirectory: '<rootDir>',
};

describe('getTestSuitePropertiesPath', () => {
  it('should replace <rootDir> in test suite properties path', () => {
    const testSuitePropertiesPath = getTestSuitePropertiesPath(
      options,
      'path/to',
    );
    expect(testSuitePropertiesPath).toEqual('/absolute/path/to/properties.js');
  });

  it('should not replace <rootDir> in test suite properties path when rootDir is not set', () => {
    const testSuitePropertiesPath = getTestSuitePropertiesPath(options);
    expect(testSuitePropertiesPath).toEqual('/absolute/<rootDir>/properties.js');
  });
});
