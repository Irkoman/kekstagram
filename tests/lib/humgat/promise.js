// tests/lib/humgat/promise.js

// Промис, упрощённый до безобразия. Но вроде работающий.

var Promise = module.exports = function(fn) {
  var promise = this;

  var resolve = function() {
    promise.thenFn && promise.thenFn();
  };

  var reject = function() {
    promise.catchFn && promise.catchFn();
  };

  fn(resolve, reject);
};

var pp = Promise.prototype;

pp.then = function(thenFn, catchFn) {
  this.thenFn = thenFn;
  this.catchFn = catchFn;
};

pp.catch = function(catchFn) {
  this.thenFn = null;
  this.catchFn = catchFn;
};
