/**
 * @fileoverview Универсальный метод для загрузки данных
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

/**
 * @param {string} url
 * @param {object} params
 * @param {function} callback
 */
var getSearchString = function(params) {
  return Object.keys(params).map(function(param) {
    return [param, params[param]].join('=');
  }).join('&');
};

var load = function(url, params, callback) {
  var xhr = new XMLHttpRequest();

  if (params) {
    url += '?' + getSearchString(params);
  }

  /** @param {ProgressEvent} */
  xhr.onload = function(event) {
    var loadedData = JSON.parse(event.target.response);
    callback(loadedData);
  };

  xhr.open('GET', url);
  xhr.send();
};

module.exports = load;
