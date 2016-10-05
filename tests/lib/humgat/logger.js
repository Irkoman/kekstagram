// tests/lib/humgat/logger.js

var doDebug = true;

var logger = module.exports = {
  debug: function(message) {
    this.messages || (this.messages = []);

    if(doDebug) {
      this.messages.push(message);
    }
  },
  getMessages: function(logConfig) {
    if(!doDebug) {
      return null;
    }

    var tailSize = logConfig.tail_size;

    var result = {
      messages: (this.messages || []).slice(-tailSize),
      count: this.messages.length
    };

    if(this.messages.length > tailSize) {
      result.messages.unshift('...');
    }

    return result;
  }
};
