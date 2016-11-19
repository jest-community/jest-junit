# jest-junit
A Jest testResultsProcessor that creates compatible junit xml files

## Installation
yarn add --dev jest-junit

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

jest-junit offers two configurations based on environment variables.

```JEST_SUITE_NAME```: Default "jest tests"

```JEST_JUNIT_OUTPUT```: Default "./junit.xml"

Example:

```shell
JEST_SUITE_NAME="Jest JUnit Unit Tests" JEST_JUNIT_OUTPUT="./artifacts/junit.xml" jest
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
