[![Build Status](https://travis-ci.org/palmerj3/jest-junit.svg?branch=master)](https://travis-ci.org/palmerj3/jest-junit)

# jest-junit
A Jest reporter that creates compatible junit xml files

## Installation
```shell
yarn add --dev jest-junit
```

## Usage
In your jest config add the following entry:
```JSON
{
  "testResultsProcessor": "jest-junit"
}
```

Then simply run:

```shell
jest
```

For your Continuous Integration you can simply do:
```shell
jest --ci --testResultsProcessor="jest-junit"
```

## Configuration

`jest-junit` offers five configurations based on environment variables or a `jest-junit` key defined in `package.json`. All configuration values should be **strings**.

| Variable Name | Description | Default |
|--|--|--|
| `JEST_SUITE_NAME` | `name` attribute of `<testsuites>` | `"jest tests"` |
| `JEST_JUNIT_OUTPUT` | File path to save the output. | `"./junit.xml"` |
| `JEST_JUNIT_CLASSNAME` | Template string for the `classname` attribute of `<testcase>`. | `"{classname} {title}"` |
| `JEST_JUNIT_TITLE` | Template string for the `name` attribute of `<testcase>`. | `"{classname} {title}"` |
| `JEST_JUNIT_ANCESTOR_SEPARATOR` | Character(s) used to join the `describe` blocks. | `" "` |
| `JEST_USE_PATH_FOR_SUITE_NAME` | Use file path as the `name` attribute of `<testsuite>` | `"false"` |

Example:

```shell
JEST_SUITE_NAME="Jest JUnit Unit Tests" JEST_JUNIT_OUTPUT="./artifacts/junit.xml" jest
```

You can also define a `jest-junit` key in your `package.json`.  All are **string** values.

```
{
  ...
  "jest-junit": {
    "suiteName": "jest tests",
    "output": "./junit.xml",
    "classNameTemplate": "{classname}-{title}",
    "titleTemplate": "{classname}-{title}",
    "ancestorSeparator": " › ",
    "usePathForSuiteName": "true"
  }
}
```

For the following test:

```js
describe('addition', () => {
  describe('positive numbers', () => {
    it('should add up', () => {
      expect(1 + 2).toBe(3);
    });
  });
});
```

The default output:

```xml
<testsuites name="jest tests">
  <testsuite name="addition" tests="1" errors="0" failures="0" skipped="0" timestamp="2017-07-13T09:42:28" time="0.161">
    <testcase classname="addition positive numbers should add up" name="addition positive numbers should add up" time="0.004">
    </testcase>
  </testsuite>
</testsuites>
```

Changing the `classNameTemplate` and `titleTemplate`:

```shell
JEST_JUNIT_CLASSNAME="{classname}" JEST_JUNIT_TITLE="{title}" jest
```

```xml
<testsuites name="jest tests">
  <testsuite name="addition" tests="1" errors="0" failures="0" skipped="0" timestamp="2017-07-13T09:45:42" time="0.154">
    <testcase classname="addition positive numbers" name="should add up" time="0.005">
    </testcase>
  </testsuite>
</testsuites>
```

Changing just the `ancestorSeparator`:

```shell
JEST_JUNIT_ANCESTOR_SEPARATOR=" › " jest
```

```xml
<testsuites name="jest tests">
  <testsuite name="addition" tests="1" errors="0" failures="0" skipped="0" timestamp="2017-07-13T09:47:12" time="0.162">
    <testcase classname="addition › positive numbers should add up" name="addition › positive numbers should add up" time="0.004">
    </testcase>
  </testsuite>
</testsuites>
```
