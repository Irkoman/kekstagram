// --- tests/lib/index.js

var path = require('path');
var runESLint = require('./eslint');
var runBasicCriterions = require('./basic');
var displayDebugInfo = require('./debug');

switch (process.env.TEST_CONFIG) {
  // Если конфигурация === 'eslint', то и запускаем только его
  case 'eslint':
  default:
    runESLint({}, ['src/js/', 'bin/data/']);
    break;

  case 'basic':
    runBasicCriterions();
    break;

  case 'advanced':
    break;

  case 'debug':
    displayDebugInfo();
    break;
}
