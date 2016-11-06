/**
 * @fileoverview Сreates pictureElement based on template
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var gallery = require('./gallery');

/**
 * @const
 * @type {number}
 */
var PHOTO_LOAD_TIMEOUT = 10000;
var template = document.getElementById('picture-template');
var templateContainer = 'content' in template ? template.content : template;
var templateElement = templateContainer.querySelector('.picture');

var getPictureElement = function(picture) {
  var pictureElement = templateElement.cloneNode(true);
  pictureElement.querySelector('.picture-comments').textContent = picture.comments;
  pictureElement.querySelector('.picture-likes').textContent = picture.likes;

  /**
   * Изображениям добавляются обработчики загрузки и ошибки
   */
  var photo = new Image(182, 182);
  var photoTimeout = null;

  photo.onload = function() {
    clearTimeout(photoTimeout);
    var img = pictureElement.querySelector('img');
    pictureElement.replaceChild(photo, img);
  };

  photo.onerror = function() {
    pictureElement.classList.add('picture-load-failure');
  };

  photo.src = picture.url;

  photoTimeout = setTimeout(function() {
    pictureElement.classList.add('picture-load-failure');
  }, PHOTO_LOAD_TIMEOUT);

  return pictureElement;
};

var Picture = function(data, index) {
  this.data = data;
  this.element = getPictureElement(this.data);

  this.element.onclick = function(event) {
    event.preventDefault();
    if(!event.target.classList.contains('picture-load-failure')) {
      gallery.show(index);
    }
  };

  this.remove = function() {
    this.element.onclick = null;
  };
};

module.exports = Picture;
