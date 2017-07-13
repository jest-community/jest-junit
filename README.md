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

`jest-junit` offers five configurations based on environment variables or a `jest-junit` key defined in `package.json`. All configuration values should **strings**.

| Variable Name | Explanation | Default |
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
