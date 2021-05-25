const path = require('path');
const getOptions = require('./getOptions');

module.exports = (options, jestRootDir)  => {
  // Override outputName and outputDirectory with outputFile if outputFile is defined
  let output = options.outputFile;
  if (!output) {
    // Set output to use new outputDirectory and fallback on original output
    const outputName = (options.uniqueOutputName === 'true') ? getOptions.getUniqueOutputName() : options.outputName
    output = path.join(options.outputDirectory, outputName);  
  }
  
  const finalOutput = getOptions.replaceRootDirInOutput(jestRootDir, output);
  return finalOutput;
};
