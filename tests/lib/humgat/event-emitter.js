// tests/lib/humgat/event-emitter.js

'use strict';

var slice = Array.prototype.slice;

var ensureCallbacks = function ensureCallbacks(obj, name) {
  obj.__callbacks || (obj.__callbacks = {});
  obj.__callbacks[name] || (obj.__callbacks[name] = []);

  return obj.__callbacks[name];
};

var EventEmitter = module.exports = {
  on: function(name, callback) {
    var callbacks = ensureCallbacks(this, name);

    if(!callbacks.some(function(fn) { return fn === callback; })) {
      callbacks.push(callback);
    }

    if(typeof(this.onSubscribe) === 'function') { this.onSubscribe(name); }

    return this;
  },
  off: function(name, callback) {
    var callbacks = ensureCallbacks(this, name);
    var index;

    if(typeof(this.onUnsubscribe) === 'function') { this.onUnsubscribe(name); }

    if(callback) {
      index = callbacks.indexOf(callback);

      if(index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.__callbacks[name] = null;
    }
  },
  emit: function(name) {
    var callbacks = ensureCallbacks(this, name);
    var args = slice.call(arguments, 1);

    if(typeof(this.onEmit) === 'function') { this.onEmit(name, args); }

    for(var i = 0; i < callbacks.length; ++i) {
      callbacks[i].apply(this, args);
    }
  }
};
