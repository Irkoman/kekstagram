// tests/lib/basic/tests-reporter.js
var logger = require('../utils/logger');

var logJSON = function(value) {
  logger.info(JSON.stringify(value, null, 2));
};

var isSuccessfull = function(json) {
  var success = true;

  if(json.result === 'FAILURE') {
    return false;
  }

  json.forEach(function(result) {
    if(result.result === 'FAILURE') {
      success = false;
    }
  });

  return success;
};

var TestReporter = module.exports = function(results) {
  this.results = results;
};

Object.assign(TestReporter.prototype, {
  report: function() {
    this.reportChapter('node');
    this.reportChapter('phantom');

    if(this.isOk()) {
      this._reportSuccess();
    } else {
      this._reportErrors();
    }
  },

  reportChapter: function(name) {
    var json = this.results[name];

    if(Array.isArray(json) && json.length > 0) {
      this._reportChapterName(name);

      json.forEach(function(task) {
        this._reportTask(task);
        task.asserts.forEach(function(assert) {
          this._reportAssert(assert);
        }, this);
      }, this);
    } else if(json.result === 'FAILURE') {
      this._reportChapterName(name, false);
    }
  },

  isOk: function() {
    var result = (
      this._isResultOk(this.results.node) &&
      this._isResultOk(this.results.phantom)
    );

    return result;
  },

  _isResultOk: function(json) {
    var success = true;

    if(json.result === 'FAILURE') {
      return false;
    }

    json.forEach(function(result) {
      if(result.result === 'FAILURE') {
        success = false;
      }
    });

    return success;
  },

  _reportSuccess: function() {
    // console.log(JSON.stringify(this.results, null, 2));
  },

  _reportErrors: function() {
    // console.log(JSON.stringify(this.results, null, 2));
  },

  _reportChapterName: function(name, flag) {
    var chapter = this.results[name];
    var meth;

    if(flag === false) {
      meth = 'error';
    } else {
      meth = this._isResultOk(chapter) ? 'info' : 'error';
    }

    logger[meth]('=== ' + name + ' ===');

    if(chapter.description) {
      logger[meth]('    ' + chapter.description);
    }
  },

  _reportTask: function(task) {
    var meth = (task.result === 'SUCCESS' ? 'info' : 'error');

    logger[meth](' -> ' + task.task + ' (' + task.title + ')');
  },

  _reportAssert: function(assert) {
    var meth = (assert.result === 'SUCCESS' ? 'info' : 'error');

    logger[meth]('    -> ' + assert.title);
  }
});
