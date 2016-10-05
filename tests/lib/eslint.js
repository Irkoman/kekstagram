// tests/lib/eslint.js
// ESLint runner

var logger = require('./utils/logger');

var runESLint = module.exports = function(eslintConfig, paths) {
  var CLIEngine = require('eslint').CLIEngine;

  var cli = new CLIEngine(eslintConfig);

  var report = cli.executeOnFiles(paths);

  if(report.errorCount > 0) {
    reportESLintErrors(report.results);

    logger.error('Error count: ' + report.errorCount);
    process.exit(1);
  }
};

function reportESLintErrors(results) {
  var padLeft = function(num, positions) {
    var str = '' + num;
    while(str.length < positions) {
      str = ' ' + str;
    }
    return str;
  };

  logger.error('ESLint errors:');

  results.forEach(function(result) {
    if(result.errorCount > 0) {
      logger.error('== File: ' + result.filePath.substr(process.cwd().length));

      result.messages.forEach(function(message) {
        logger.error(
          '  ' + padLeft(message.line, 3) + ':' +
          padLeft(message.column, 3) + ', ' +
          message.message
        );

        logger.debug(
          '     Code: ' + message.source
        );
      });
    }
  });
}
