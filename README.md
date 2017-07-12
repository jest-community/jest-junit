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
  "testResultsProcessor": "./node_modules/jest-junit"
}
```

Then simply run:

```shell
jest
```

## Configuration

`jest-junit` offers five configurations based on environment variables.  All are **string** values

| Variable Name | Default |
|--|--|
| `JEST_SUITE_NAME` | `"jest tests"` |
| `JEST_JUNIT_OUTPUT` | `"./junit.xml"` |
| `JEST_JUNIT_CLASSNAME` | `"{classname} {title}"` |
| `JEST_JUNIT_TITLE` | `"{classname} {title}"` |
| `JEST_USE_PATH_FOR_SUITE_NAME` | `"false"` |

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
        "usePathForSuiteName": "true"
    }
}
```

Example output:
```xml
<testsuites name="Jest JUnit Unit Tests">
  <testsuite name="My first suite" tests="1" errors="0" failures="0" skipped="0" timestamp="2016-11-19T01:37:20" time="0.105">
    <testcase classname="My test case" name="My test case" time="6">
    </testcase>
  </testsuite>
</testsuites>
```

Changing the title and classname

```shell
JEST_JUNIT_CLASSNAME="{classname}" JEST_JUNIT_TITLE="{title}" jest
```

```xml
<testsuites name="jest tests">
  <testsuite name="foo" tests="1" errors="0" failures="0" skipped="0" timestamp="2017-02-19T22:36:15" time="0.232">
    <testcase classname="foo" name="bar" time="0.003">
    </testcase>
  </testsuite>
</testsuites>
```
