/**
 * @fileoverview
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

/**
 * Функция для выполнения JSONP-запросов. Название коллбэка
 * опционально (если не передано, генерируется случайное).
 * @param {string} url
 * @param {function} callback
 * @param {string} callbackName
 */
var load = function(url, callback, callbackName) {
  if (!callbackName) {
    callbackName = 'callback' + Date.now();
  }

  window[callbackName] = function(data) {
    callback(data);
  };

  /**
   * С помощью тега <script> делаем запрос
   * к скрипту с данными на сервере
   */
  var script = document.createElement('script');
  script.src = url + '?callback=' + callbackName;
  document.body.appendChild(script);
};

module.exports = load;
