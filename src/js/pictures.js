/**
 * @fileoverview
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var load = require('./load');
var gallery = require('./gallery');
var Picture = require('./picture');

module.exports = function() {
  var DATA_LOAD_URL = 'http://localhost:1507/api/pictures';
  var container = document.querySelector('.pictures');

  /**
   * Прячем блок с фильтрами
   */
  var filters = document.querySelector('.filters');
  filters.classList.add('hidden');

  /**
   * Проходит по массиву pictures и вызывает функцию отрисовки
   * для каждого элемента, после чего добавляет его на страницу.
   * @param {Object[]} pictures
   */
  var renderPictures = function(pictures) {
    pictures.forEach(function(picture, index) {
      var newPicture = new Picture(picture, index);
      container.appendChild(newPicture.element);
    });

    gallery.setPictures(pictures);
  };

  /**
   * Загрузка данных (после которой вызывается функция
   * для отрисовки фотографий) и показ блока с фильтрами
   */
  load(DATA_LOAD_URL, renderPictures, 'getPictures');
  filters.classList.remove('hidden');
};
