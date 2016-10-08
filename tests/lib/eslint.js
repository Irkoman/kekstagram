// tests/lib/eslint.js
// ESLint runner

'use strict';

require('colors');

var reportESLintErrors = function(results) {
  var padRight = function(string, positions) {
    var str = string;
    while(str.length < positions) {
      str = str + ' ';
    }
    return str;
  };

  var removeDot = function(str) {
    if(str.substr(str.length - 1, 1) === '.') {
      return str.substr(0, str.length - 1);
    } else {
      return str;
    }
  };

  results.forEach(function(result) {
    if(result.errorCount > 0) {
      console.log(result.filePath.underline);

      result.messages.forEach(function(message) {

        console.log(
          '  ' +
          padRight('' + message.line + ':' + message.column, 6).red +
          (message.severity < 2 ? 'warn   '.yellow : 'error  '.red) +
          padRight(removeDot(message.message), 37) +
          message.ruleId
        );
      });
    }
  });
};

module.exports = function runESLint(eslintConfig, paths) {
  var CLIEngine = require('eslint').CLIEngine;

  var exit = process.exit;

  var cli = new CLIEngine(eslintConfig);

  var report = cli.executeOnFiles(paths);

  var pluralize = function(word, count) {
    if(count > 1) {
      return '' + count + ' ' + word + 's';
    } else {
      return '' + count + ' ' + word;
    }
  };

  if(report.errorCount > 0) {
    reportESLintErrors(report.results);

    console.log(('× ' + pluralize('problem',
      report.errorCount + report.warningCount) +
      ' ' + pluralize('error', report.errorCount) + ', ' +
      pluralize('warning', report.warningCount)).red.bold
    );

    exit(1);
  }
};

