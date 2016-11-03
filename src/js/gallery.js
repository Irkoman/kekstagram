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
  this.pictures = pictures;
};

Gallery.prototype.show = function(index) {
  var self = this;

  galleryClose.onclick = function() {
    self.hide();
  };

  galleryImage.onclick = function() {
    if(self.activePicture < self.pictures.length - 1) {
      self.setActivePicture(++self.activePicture);
    } else {
      self.setActivePicture(0);
    }
  };

  gallery.classList.remove('invisible');

  self.setActivePicture(index);
};

Gallery.prototype.hide = function() {
  galleryClose.onclick = null;
  galleryImage.onclick = null;
  gallery.classList.add('invisible');
};

Gallery.prototype.setActivePicture = function(index) {
  this.activePicture = index;
  galleryImage.src = this.pictures[index].url;
  gallery.querySelector('.likes-count').textContent = this.pictures[index].likes;
  gallery.querySelector('.comments-count').textContent = this.pictures[index].comments;
};

module.exports = new Gallery();
