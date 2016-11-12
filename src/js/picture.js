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

var Picture = function(data) {
  var self = this;
  this.data = data;
  this.element = templateContainer.querySelector('.picture').cloneNode(true);
  this.element.querySelector('.picture-comments').textContent = data.comments;
  this.element.querySelector('.picture-likes').textContent = data.likes;

  this.element.onclick = function(event) {
    event.preventDefault();
    var element = event.currentTarget;
    var parent = event.currentTarget.parentNode;

    self.index = Array.prototype.indexOf.call(parent.childNodes, element);

    if (!event.target.classList.contains('picture-load-failure')) {
      gallery.show(self.index - 1);
    }
  };

  var img = this.element.querySelector('img');
  this.renderPicture(img, data.url);
};

Picture.prototype.remove = function() {
  this.element.onclick = null;
};

Picture.prototype.renderPicture = function(img, url) {
  var self = this;
  var photo = new Image(182, 182);
  var photoTimeout = null;

  /**
   * Обработчики загрузки и ошибки
   */
  photo.onload = function() {
    clearTimeout(photoTimeout);
    self.element.replaceChild(photo, img);
  };

  photo.src = url;

  photo.onerror = function() {
    self.element.classList.add('picture-load-failure');
  };

  photoTimeout = setTimeout(function() {
    self.element.classList.add('picture-load-failure');
  }, PHOTO_LOAD_TIMEOUT);

  return this.element;
};

module.exports = Picture;
