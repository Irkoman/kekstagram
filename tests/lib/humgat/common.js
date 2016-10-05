// tests/lib/humgat/common.js

var humgatDebug = true;
var logger = require('./logger');

var humgatCommon = module.exports = function(humgat) {
  if(humgatDebug) {
    humgat.onSubscribe = function(name) {
      // logger.debug('Subscribe to `' + name + '`');
    };

    humgat.onUnsubscribe = function(name) {
      // logger.debug('Unsubscribe from `' + name + '`');
    };

    humgat.onEmit = function(name, args) {
      if(name.indexOf('console') > -1 ||
         name.indexOf('server.read') > -1 ||
         // name.indexOf('received') > -1 ||
         name.indexOf('page.') === 0
        ) {
        logger.debug('Emit `' + name + '`, ' + JSON.stringify(args));
      }
    };
  }

  humgat.
    on('humgat.config', function() {

      var cfg = require('../config/index.js');

      this._setConfiguration(
        require('../config/index.js').phantom
      );
    }).
    on('page.initialized', function() {
      var page = this.getPage();
      var config = this.config;

      if(page.injectJs(config.shims)) {
        this.emit('page.shims.loaded');
      } else {
        this.emit('page.shims.failure');
      }
    }).
    on('page.shims.failure', function() {
      this.exitOnFailure('Could not load shims');
    }).
    on('page.open.failure', function() {
      this.exitOnFailure('Could not open url: ' + this.config.url);
    }).
    on('humgat.start', function() {
      var config = this.config;

      this.viewport(config.page);
      this.open(config.url);
    }).
    on('assert.fail', function() { this.testResult = false; }).
    on('suite.done', humgat.exitWithSuiteResults.bind(humgat)).
    on('suite.failure', humgat.exitWithSuiteResults.bind(humgat));
};
