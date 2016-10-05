// --- tests/lib/basic.js

var getBranchName = require('./utils/parameters').getBranchName;

var Suite = require('./basic/suite');

var logger = require('./utils/logger');

var runBasicCriterions = module.exports = function() {
  // Выделяем модуль
  var suite = new Suite(getBranchName());

  logger.debug('runBasicCriterions()');

  suite.run().then(function(flag) {
    process.exit(flag ? 0 : 1);
  }).catch(function(err) {
    logger.error('=== Unexpected failure ===');
    logger.error(err.toString());
    process.exit(1);
  });
};
