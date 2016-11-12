/**
 * @fileoverview Describes constructor Gallery
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var gallery = document.querySelector('.gallery-overlay');
var galleryClose = gallery.querySelector('.gallery-overlay-close');
var galleryImage = gallery.querySelector('.gallery-overlay-image');

var Gallery = function() {
  this.pictures = [];
  this.activePicture = 0;
};

Gallery.prototype.setPictures = function(pictures) {
  this.pictures = this.pictures.concat(pictures);
};

Gallery.prototype.clearPictures = function() {
  this.pictures = [];
};

Gallery.prototype.show = function(index) {
  var self = this;

  galleryImage.onclick = function() {
    if (self.activePicture === self.pictures.length - 1) {
      self.setActivePicture(0);
    } else {
      self.setActivePicture(self.activePicture + 1);
    }
  };

  gallery.classList.remove('invisible');
  galleryClose.onclick = self.hide;
  self.setActivePicture(index);
};

Gallery.prototype.hide = function() {
  gallery.classList.add('invisible');
  galleryClose.onclick = null;
  galleryImage.onclick = null;
};

Gallery.prototype.setActivePicture = function(index) {
  this.activePicture = index;
  galleryImage.src = this.pictures[index].url;
  gallery.querySelector('.likes-count').textContent = this.pictures[index].likes;
  gallery.querySelector('.comments-count').textContent = this.pictures[index].comments;
};

module.exports = new Gallery();
