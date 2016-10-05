var ASSERT_SUCCESS = 'SUCCESS';
var ASSERT_FAILURE = 'FAILURE';

var NodeTestCase = module.exports = function(name, hash) {
  this.name = name;
  this.result = true;
  this.asserts = [];

  if(hash) {
    Object.assign(this, hash);
  }
};

Object.assign(NodeTestCase.prototype, {
  run: function() {
    try {
      this.runAsserts(); // should be implemented in super-class
    } catch(err) {
    }

    return {
      result: this.result ? 'SUCCESS' : 'FAILURE',
      title: this.title,
      type: 'node',
      task: this.name,
      asserts: this.asserts
    };
  },

  assertEqual: function(expected, actual, message) {
    this.assert(expected === actual, message);
  },

  assert: function(condition, message) {
    var reason = null;

    if(typeof (condition) === 'function') {
      try {
        condition = condition();
      } catch(err) {
        reason = err.toString();
        condition = false;
      }
    }

    if(condition) {
      this._addSuccess(message);
    } else {
      this._addFailure(message, reason);
    }

    return condition;
  },

  fatalAssert: function(condition, message) {
    if(!this.assert(condition, message)) {
      throw new Error(message);
    }
  },

  _addSuccess: function(message) {
    this.asserts.push({ title: message, result: ASSERT_SUCCESS });
  },

  _addFailure: function(message, reason) {
    this.asserts.push({
      title: message,
      result: ASSERT_FAILURE,
      reason: reason
    });

    this.result = false;
  }
});
