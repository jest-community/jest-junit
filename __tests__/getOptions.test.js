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
