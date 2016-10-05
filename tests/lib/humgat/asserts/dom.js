// tests/lib/humgat/asserts/dom.js

var DOM = module.exports = function DOM(humgat) {
  this.humgat = humgat;
};

var dp = DOM.prototype;

dp.assert = function(fn, message) {

  var humgat = this.humgat;
  var page = humgat.getPage();

  var condition = page.evaluate(fn);

  if(!condition) {
    humgat.emit('assert.fail');
  }

  humgat.addResult({
    title: message,
    result: condition ? 'SUCCESS' : 'FAILURE'
  });

  return condition;
};

dp.assertEqual = function(expected, fn, message) {

  var humgat = this.humgat;
  var page = humgat.getPage();

  var actual = page.evaluate(fn);
  var result = expected === actual;

  humgat.emit('console.log', expected, actual);

  if(!result) {
    humgat.emit('assert.fail');
  }

  humgat.addResult({
    title: message,
    result: result ? 'SUCCESS' : 'FAILURE'
  });

  return result;
};

dp.measure = function(selector) {
  var page = this.humgat.getPage();

  var br = page.evaluate(function(selector) {
    var element = document.querySelector(selector);
    return element.getBoundingClientRect();
  }, selector);

  humgat.emit('console.log', JSON.stringify(br, null, 2));

  return br;
};

dp.click = function(selector) {
  var page = this.humgat.getPage();

  var br = page.evaluate(function(selector) {
    var element = document.querySelector(selector);
    return element.getBoundingClientRect();
  }, selector);

  page.sendEvent('click', br.left + 1, br.top + 1);
};

dp.empty = function(selector) {
  var page = this.humgat.getPage();

  page.evaluate(function(selector) {
    var element = document.querySelector(selector);
    element.value = '';
  }, selector);
};

dp.fillIn = function(selector, value) {
  var page = this.humgat.getPage();

  this.empty(selector);
  this.click(selector);
  page.sendEvent('keypress', '' + value);
};

dp.css = function(selector, cssHash) {
  var page = this.humgat.getPage();

  page.evaluate(function(selector, cssHash) {
    var elements = document.querySelectorAll(selector);
    var i, element;

    for(var i = 0; i < elements.length; ++i) {
      element = elements[i];

      for(var key in cssHash) {
        element.style[key] = cssHash[key];
      }
    }
  }, selector, cssHash);
};
