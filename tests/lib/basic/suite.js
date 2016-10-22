// tests/lib/basic/suite.js

// Выделяем номер задания
// Выполняем все доступные в файловой системе тесты
//   у которых либо номер модуля меньше текущего
//   либо номер модуля тот же, а номер таска - меньше или равен

// Файлы раскладываем следующим образом
// tests/lib/
//          /moduleX-taskY/node-test.js // -- тест выполняется в node
//                        /phantomjs-test.js // -- тест выполняется в phantomjs-test

var parseBranchName = require('../utils/parameters').parseBranchName;
var logger = require('../utils/logger');
var config = require('../config');
var path = require('path');
var fs = require('fs');
var glob = require('glob');

var metaInfo = {};

var PhantomTest = require('./phantom-test');

var TestReporter = require('./test-reporter');

var Suite = module.exports = function(branchName) {
  var branch = parseBranchName(branchName);

  this.module = branch.module;
  this.task = branch.task;
};

var branchInfoIsBigger = function(thisBi, otherBi) {

  // === cases ===
  // this: { 3, 2 }
  //   bi: { 3, 2 } => true
  //   bi: { 2, * } => true
  //   bi: { 4, * } => false
  //   bi: { 3, 3 } => false
  //   bi: { 3, 1 } => true

  return (
    otherBi.module < thisBi.module ||
      (
        otherBi.module === thisBi.module &&
          otherBi.task <= thisBi.task
      )
  );
};

var getMetaInfo = function(folder) {
  var text, data = {};

  if(!metaInfo[folder]) {
    try {
      text = fs.readFileSync(path.join(folder, 'meta.json'), 'utf8');
      data = JSON.parse(text);
    } catch(err) {
      // 1. File not found
      // 2. Garbage in meta.json
      logger.debug(err.toString());
    }

    metaInfo[folder] = data;
  }

  return metaInfo[folder];
};

var sp = Suite.prototype;

/**
 * @return {Promise} promise it resolves if all tests are ok
 *                           it rejects if some tests are failed
 */
sp.run = function() {
  // logger.debug('TEST_ROOT=' + path.resolve(config.tests_root));
  // 1. Определить корень папок с тестовыми скриптами
  // 2. Отобрать только те, что подходят по критериям
  // 3. Выполнить отобранные
  //    phantom- тесты возвращают результат через stdout
  //    node- тесты возвращают результат как значение
  // 4. Отобразить результаты, как строку разноцветных точек
  // 5. Отобразить ошибки, если есть
  // 6. Выйти с кодом 1, если есть ошибки

  var nodeTestFolders = this._getTestFolders('node-');
  var phantomTestFolders = this._getTestFolders('phantom-');

  logger.debug('Suite.run()');

  var nodeTestsPromise = this._getNodeTestsInFolders(nodeTestFolders);
  var phantomTestsPromise = this._getPhantomTestsInFolders(phantomTestFolders);

  phantomTestsPromise.then(function(result) {
    logger.debug('Got from phantom tests:\n' + JSON.stringify(result, null, 2));
  });

  var suitePromise = Promise.all([
    phantomTestsPromise.then(function(result) {
      return { phantom: result };
    }),
    nodeTestsPromise.then(function(result) {
      return { node: result };
    }) /* no ; here */
  ]);

  return suitePromise.then(function(result) {
    var results = Object.assign(result[0], result[1]);
    var reporter = new TestReporter(results);

    reporter.report();

    return reporter.isOk();
  });
};

sp._getTestFolders = function(prefix) {
  var testsRoot = path.resolve(config.tests_root);
  var paths = glob.sync(testsRoot + '/module*-task*');
  var suite = this;

  return (
    paths.filter(function(fullPath) {
      var taskName = path.basename(fullPath);
      var branchInfo = parseBranchName(taskName);

      // === search for prefixed tests (when prefix is specified) ===
      var tests;

      if(typeof(prefix) === 'string') {
        tests = glob.sync(path.join(fullPath, prefix + '*.js'));

        if(tests.length === 0) {
          return false;
        }
      }

      return branchInfoIsBigger(this, branchInfo);
    }, this)
  );
};

sp._getNodeTestsInFolders = function(folders) {
  var promises = folders.filter(function(folder) {
    var meta = getMetaInfo(folder);
    var uptoBi = (meta.node || {}).upto;

    return (
      !uptoBi ||
      branchInfoIsBigger(parseBranchName(uptoBi), this)
    );
  }, this).map(function(folder) {
    return this._getNodeTestIn(folder);
  }, this);

  return Promise.all(promises);
};

sp._getPhantomTestsInFolders = function(folders) {
  var suite = this;
  var npmStart;

  folders = folders.filter(function(folder) {
    var meta = getMetaInfo(folder);
    var uptoBi = (meta.phantom || {}).upto;

    return (
      !uptoBi ||
      branchInfoIsBigger(parseBranchName(uptoBi), this)
    );
  }, this);

  if(folders.length === 0) {
    logger.info('No folders found');
    return new Promise(function(resolve) { resolve([]); });
  }

  npmStart = PhantomTest.npmStart();

  return (
    npmStart.promise.then(function(result) {
      logger.debug('from npm start:\n' + JSON.stringify(result, null, 2));

      if(result.result === 'SUCCESS') {
        var promises = folders.map(function(folder) {
          return this._getPhantomTestIn(folder);
        }, suite);

        return Promise.all(promises);
      } else {
        return result;
      }
    }).then(function(results) {
      logger.debug('npm then');

      process.kill(-npmStart.process.pid);

      return results;
    }).catch(function(err) {
      logger.debug('npm catch');
      logger.error(err.toString());
      logger.error(err.toSource());
      logger.error(err.stack);

      process.kill(-npmStart.process.pid);
    }) /* no ; here. it's value! */
  );
};

sp._getNodeTestIn = function(folder) {
  var testPath = glob.sync(path.join(folder, 'node-*.js'))[0];
  var test = require(testPath);

  var testResult = test();

  if(testResult instanceof Promise) {
    return testResult;
  } else {
    return new Promise(function(resolve) {
      resolve(testResult);
    });
  }
};

sp._getPhantomTestIn = function(folder) {
  var testPath = glob.sync(path.join(folder, 'phantom-*.js'))[0];
  var taskName = path.basename(folder);

  logger.debug('_getPhantomTestIn()');
  logger.debug(config.phantom.screenshots.path);

  logger.debug(taskName);

  var screenshotsDir = path.join(
    config.phantom.screenshots.path,
    taskName
  );

  logger.debug(screenshotsDir);

  var test = new PhantomTest(testPath, screenshotsDir);

  return test.run();
};
