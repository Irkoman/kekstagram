// tests/lib/basic/phantom-test.js

var config = require('../config').phantom;
var logger = require('../utils/logger');

var spawn = require('child_process').spawn;
var execSync = require('child_process').execSync;

var path = require('path');
var fs = require('fs');

var PhantomTest = module.exports = function(fullPath, screenshotPath) {
  logger.debug('PhantomTest.ctor()');

  logger.debug(screenshotPath);

  this.fullPath = fullPath;
  this.screenshotPath = screenshotPath;
};

PhantomTest.npmStart = function() {
  var npm = spawn('npm', ['start'], {detached: true});

  var npmStopLine = config.npmStart.stopLine;
  var npmStartLine = config.npmStart.startLine;

  var watchNpm = function(resolve, reject) {
    npm.stdout.on('data', function(buffer) {
      var text = buffer.toString();

      if(npmStopLine && text.indexOf(npmStopLine) > -1) {
        logger.error('Could not start dev server');
        resolve({
          result: 'FAILURE',
          reason: 'Could not start dev server',
          description: 'Не получается запустить девсервер. Попробуйте npm install и почитать package.json'
        });
      } else if(text.indexOf(npmStartLine) > -1) {
        resolve({
          result: 'SUCCESS'  // => Let's run phantom tests
        });
      }
    });

    npm.stderr.on('data', function(buffer) {
      var text = buffer.toString();

      if(text.indexOf('ADDRINUSE') > -1) {
        resolve({
          result: 'FAILURE',
          reason: 'Address in use',
          description: 'Возможно, запущен ещё один девсервер. Попробуйте его остановить и повторить тест'
        });
      }
    });
  };

  return {
    promise: new Promise(watchNpm),
    process: npm
  };
};

var runPhantomJS = function(fullPath, screenshotsPath) {
  var taskName = path.basename(path.dirname(fullPath));

  var wrapResult = function(result) {
    result.task = taskName;

    return result;
  };

  var runPJ = function(resolve, reject) {
    logger.debug('runPJ');

    var phantomJS = spawn('phantomjs', [fullPath, screenshotsPath]);

    var phantomStdout = '';

    phantomJS.stdout.on('data', function(buffer) {
      var text = buffer.toString();
      phantomStdout = phantomStdout + text;
      logger.debug(text);

      if(text.indexOf('in __webpack_require__') > -1) {
        phantomJS.kill();
      }
    });

    phantomJS.stderr.on('data', function(buffer) {
      var text = buffer.toString();
      logger.warn(text);
    });

    phantomJS.on('exit', function(code) {
      if(code > 0) {
        logger.error('PhantomJs could not work properly');
        resolve(wrapResult({
          result: 'FAILURE',
          reason: 'PhantomJs could not work properly'
        }));
      } else {
        logger.info('PhantomJS work completed');
        resolve(wrapResult(JSON.parse(phantomStdout)));
      }
    });
  };

  logger.info('phantomjs ' + fullPath);

  return new Promise(runPJ);
};

var tp = PhantomTest.prototype;

tp.run = function() {
  var test = this;

  logger.debug('PhantomTest.run()');

  this.cleanupScreenshotDir();

  logger.debug(this.screenshotPath);

  return (
    runPhantomJS(this.fullPath, this.screenshotPath).
      then(function(result) {
        if(result.result === 'PENDING') {
          return test.compareScreenshots(result);
        } else {
          return result;
        }
      })
  );
};

tp.cleanupScreenshotDir = function() {
  logger.debug('PhantomTest.cleanupScreenshotDir()');

  try {
    // Throws error when ./tests/screenshots not created yet
    if(fs.statSync(this.screenshotPath).isDirectory()) {
      execSync('rm -f screenshot-*.png', {cwd: this.screenshotPath});
    }
  } catch(err) {
  }
};

tp.compareScreenshots = function(results) {
  // модифицировать results.tests[].{result,percent} в соответствии с результатами сравнения скриншотов
  // модифицировать results.result

  var testResult = true;

  results.asserts.forEach(function(assert) {
    var pathToEtalon, pathToScreenshot;
    var taskName, baseName;
    var result;

    if(assert.type === 'SCREENSHOT') {
      pathToScreenshot = assert.path;
      baseName = path.basename(pathToScreenshot);

      logger.debug(pathToScreenshot);

      taskName = path.basename(path.dirname(pathToScreenshot));

      logger.debug(taskName);

      pathToEtalon = path.join(config.screenshots.etalon, taskName, baseName);

      result = this.compareTwoScreenshots(
        pathToEtalon, pathToScreenshot,
        assert
      );

      assert.result = result ? 'SUCCESS' : 'FAILURE';
    }

    if(assert.result === 'FAILURE') {
      testResult = false;
    }
  }, this);

  results.result = testResult ? 'SUCCESS' : 'FAILURE';

  return results;
};

var COMPARE_RE = /\d+(\.\d+)?\s+\((\d+(\.\d+)?(e[-+]\d+)?)\)/i;

tp.compareTwoScreenshots = function(etalon, screenshot, assert) {
  var treshold = assert.treshold;

  logger.debug('Compare:');
  logger.debug('      Etalon: ' + etalon);
  logger.debug('  Screenshot: ' + screenshot);

  var text = execSync(
    'compare -metric RMSE ' +
    etalon + ' ' + screenshot + ' /dev/null 2>&1'
  ).toString();

  logger.debug(text);

  var md = COMPARE_RE.exec(text);
  var percent;
  var result = true;

  if(md) {
    percent = parseFloat(md[2]);

    assert.percent = 100 - percent;
    result = (100 - percent) > treshold;

    result.expected = etalon;

    logger.debug('Screenshot ' + screenshot + ' got ' + assert.percent + '%');
  } else {
    result = false;
    assert.description = 'Wrong compare output\n' + text;
  }

  return result;
};
