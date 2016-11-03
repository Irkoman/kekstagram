/**
 * @fileoverview
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var load = require('./load');
var getPictureElement = require('./picture');
var gallery = require('./gallery');

module.exports = function() {
  /**
   * Время, отведённое на ожидание загрузки фотографии
   * @const
   * @type {number}
   */
  var PHOTO_LOAD_TIMEOUT = 10000;
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
    var template = document.getElementById('picture-template');
    var templateContainer = 'content' in template ? template.content : template;
    var templateElement = templateContainer.querySelector('.picture');

    pictures.forEach(function(picture, index) {
      var newPictureElement = getPictureElement(picture, index, templateElement, PHOTO_LOAD_TIMEOUT);
      container.appendChild(newPictureElement);
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
