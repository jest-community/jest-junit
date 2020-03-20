const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const { makeDirRecursive } = require('../utils/makeDir');

describe('makeDir', () => {
  it ('should create non-nested directory', () => {
    const testPath = path.join('.', 'foo');

    rimraf.sync(testPath);

    const result = makeDirRecursive(testPath);

    expect(result).toBe(true);
    expect(fs.existsSync(testPath)).toBe(true);

    rimraf.sync(testPath);
  });

  it ('should create a nested directory', () => {
    const testPath = path.join('.', 'foo', 'foo2');

    rimraf.sync(testPath);

    const result = makeDirRecursive(testPath);

    expect(result).toBe(true);
    expect(fs.existsSync(testPath)).toBe(true);

    rimraf.sync(path.join('.', 'foo'));
  });

  it ('should return true if path already exists', () => {
    const testPath = path.join('.', 'foo');

    rimraf.sync(testPath);

    const result = makeDirRecursive(testPath);

    expect(result).toBe(true);
    expect(fs.existsSync(testPath)).toBe(true);


    const result2 = makeDirRecursive(testPath);
    expect(result).toBe(true);
    expect(fs.existsSync(testPath)).toBe(true);

    rimraf.sync(testPath);
  });

  it ('should support a lot of nesting', () => {
    const rootPath = path.join('.', 'foo');
    const testPath = path.join(rootPath, 'foo2', 'foo3', 'foo4', 'foo5', 'foo6', 'foo7', 'foo8', 'foo9');

    rimraf.sync(rootPath);

    const result = makeDirRecursive(testPath);

    expect(result).toBe(true);
    expect(fs.existsSync(testPath)).toBe(true);

    rimraf.sync(rootPath);
  });
});
