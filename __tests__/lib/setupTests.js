const xml = require('xml');
const path = require('path');
const fs = require('fs');
const libxmljs = require('libxmljs');

const schemaPath = path.join(__dirname, 'junit.xsd');
const schemaStr = fs.readFileSync(schemaPath);
const schema = libxmljs.parseXmlString(schemaStr);

global.expect.extend({
  toBeCompliantJUnit(jsonResults) {
    const xmlStr = xml(jsonResults, { indent: '  '});

    const libxmljsObj = libxmljs.parseXmlString(xmlStr);
    const isValid = libxmljsObj.validate(schema);

    if (!isValid) {
      return {
        message: () => `${libxmljsObj.validationErrors.join('\n')}\n${xmlStr}`,
        pass: false
      }
    } else {
      return {
        message: () => `expected not to validate against junit xsd`,
        pass: true
      }
    }
  }
});
