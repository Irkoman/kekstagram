// utils/logger.js
//
'use strict';

var log4js = require('log4js');
var config = require('../config');
var level = config.log_level;

log4js.configure({
  appenders: [
    {
      type: 'console',
      category: 'basic',
      layout: {
        type: 'pattern',
        pattern: '%[%r %5.5p: %m%]'
      }
    }
  ]
});

var logger = log4js.getLogger('basic');
logger.setLevel(level);

module.exports = logger;
