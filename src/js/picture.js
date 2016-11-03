/**
 * @fileoverview Сreates pictureElement based on template
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var gallery = require('./gallery');

var getPictureElement = function(picture, index, templateElement, PHOTO_LOAD_TIMEOUT) {
  var pictureElement = templateElement.cloneNode(true);

  pictureElement.querySelector('.picture-likes').textContent = picture.likes;
  pictureElement.querySelector('.picture-comments').textContent = picture.comments;

  /**
   * Изображениям добавляются обработчики загрузки и ошибки
   */
  var photo = new Image(182, 182);
  var photoTimeout = null;

  photo.onload = function() {
    clearTimeout(photoTimeout);
    var img = pictureElement.querySelector('img');
    img.src = picture.url;
  };

  photo.onerror = function() {
    pictureElement.classList.add('picture-load-failure');
  };

  pictureElement.onclick = function(event) {
    event.preventDefault();

    if(!pictureElement.classList.contains('picture-load-failure')) {
      gallery.show(index);
    }
  };

  photo.src = picture.url;

  photoTimeout = setTimeout(function() {
    pictureElement.classList.add('picture-load-failure');
  }, PHOTO_LOAD_TIMEOUT);

  return pictureElement;
};

module.exports = getPictureElement;
