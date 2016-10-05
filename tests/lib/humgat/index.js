// tests/lib/humgat/index.js

var EventEmitter = require('./event-emitter.js');
var system = require('system');
var fs = require('fs');
var logger = require('./logger.js');
var DOM = require('./asserts/dom.js')
var Screenshot = require('./asserts/screenshot.js');


var Humgat = module.exports = function() {
  this.dom = new DOM(this);
  this.screenshot = new Screenshot(this, system.args[1]);

  this.results = [];
};

Humgat.create = function() {
  return new Humgat();
};

var hp = Humgat.prototype;

hp.on = EventEmitter.on;
hp.off = EventEmitter.off;
hp.emit = EventEmitter.emit;

hp.exitWithJSON = function(json) {
  var string;

  try {
    json.log = logger.getMessages(this.config.log);
    string = JSON.stringify(json, null, 2);
  } catch(err) {
    string = JSON.stringify({
      result: 'FAILURE',
      reason: 'Не удалось вывести результат'
    }, null, 2);
  }

  console.log(string);
  phantom.exit();
};

hp.run = function() {
  this.testResult = true;
  this.hasScreenshots = false;
  this.assertResults = [];

  this.emit('humgat.config'); // take config from somewhere
  this.emit('humgat.start');  // start opening page

  this._setupExitTimeout();
};

hp.exitOnFailure = function(reason) {
  this.exitWithJSON({
    title: (this.title || 'Задание без имени'),
    type: 'phantom',
    result: 'FAILURE',
    reason: reason
  });
};

hp.exitWithSuiteResults = function() {
  this.exitWithJSON({
    title: (this.title || 'Задание без имени'),
    type: 'phantom',
    result: this._getTestResult(),
    asserts: this.assertResults
  });
};

hp.viewport = function(w, h) {
  var page = this.getPage();

  if(arguments.length === 1) {
    page.viewportSize = w;
  } else {
    page.viewportSize = {
      width: w,
      height: h
    };
  }
};

hp.cliprect = function(l, t, w, h) {
  var page = this.getPage();

  if(arguments.length === 1) {
    page.clipRect = l;
  } else {
    page.clipRect = {
      left: l,
      top: t,
      width: w,
      height: h
    };
  }
};

hp.open = function() {
  var humgat = this;
  var page = this.getPage();
  var config = this.config;

  page.open(config.url, function(status) {
    if(status === 'success') {
      humgat.emit('page.open.success');
    } else {
      humgat.emit('page.open.failure');
    }
  });
};

hp.getPage = function() {
  var page = this.page;

  if(!page) {
    page = this.page = require('webpage').create();
    this._initializePage(page);
    this._initializeResources(page);
  }

  return page;
};

hp.addResult = function(obj) {
  this.assertResults || (this.assertResults = []);
  this.assertResults.push(obj);
};

hp.addFailure = function(message) {
  this.testResult = false;
  this.addResult({
    title: message,
    result: 'FAILURE'
  });
};

hp.addSuccess = function(message) {
  this.addResult({
    title: message,
    result: 'SUCCESS'
  });
};

hp.getCookie = function(_name) {
  var cookies = this.page.cookies;
  var name, value;

  for(var i in cookies) {
    name = cookies[i].name;

    if(name === _name) {
      value = decodeURIComponent(cookies[i].value);

      return {
        name: name,
        value: value,
        expires: cookies[i].expires
      };
    }
  }

  return null;
};

hp.assertEqual = function(expected, actual, message) {
  var result = (expected === actual);

  if(result) {
    this.addSuccess(message);
  } else {
    this.addFailure(message);
  }
};

hp._setupExitTimeout = function() {
  var timeout = (this.config && this.config.timeout) || 5000;

  setTimeout(this.exitOnFailure.bind(this, 'Timeout'), timeout);
};

hp._setConfiguration = function setConfiguration(config) {
  this.config = config;
};

hp._initializePage = function(page) {
  var humgat = this;

  page.onConsoleMessage = function(message) {
    humgat.emit('page.console', message);
  };

  page.onInitialized = function() {
    humgat.emit('page.initialized');
  };

  page.onLoadStarted = function() {
    humgat.emit('page.load.started');
  };

  page.onLoadFinished = function(status) {
    if(status === 'success') {
      humgat.emit('page.loaded');
    } else {
      humgat.emit('page.load.failure');
    }
  };
};

hp._initializeResources = function(page) {
  var humgat = this;

  page.onResourceRequested = function(requestData, networkRequest) {
    humgat.emit('resource.requested', requestData, networkRequest);
  };

  page.onResourceReceived = function(response) {
    humgat.emit('resource.received', response);
  };

  page.onResourceError = function(error) {
    humgat.emit('resource.error', error);
  };
};

hp._getTestResult = function() {
  if(this.hasScreenshots) {
    return 'PENDING';
  } else {
    if(this.testResult) {
      return 'SUCCESS';
    } else {
      return 'FAILURE';
    }
  }
};
