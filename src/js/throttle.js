/**
 * @fileoverview Универсальная функция-«декоратор» throttle
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

/**
 * @param {function} func
 * @param {number} timeout
 */
function throttle(func, timeout) {
  var isThrottled = false;
  var savedThis;
  var savedArguments;

  function wrapper() {
    /**
     * Все новые вызовы запоминаются в замыкании
     */
    if (isThrottled) {
      savedThis = this;
      savedArguments = arguments;
      return;
    }

    /**
     * Функция-обёртка wrapper при первом вызове
     * запускает func и переходит в состояние паузы
     */
    func.apply(this, arguments);
    isThrottled = true;

    /**
     * По завершении таймаута пауза снимается, а wrapper запускается
     * с последними аргументами и контекстом, если были вызовы
     */
    setTimeout(function() {
      isThrottled = false;
      if (savedArguments) {
        wrapper.apply(savedThis, savedArguments);
        savedArguments = savedThis = null;
      }
    }, timeout);
  }

  return wrapper;
}

module.exports = throttle;
