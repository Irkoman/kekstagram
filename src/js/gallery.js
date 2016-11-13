/**
 * @fileoverview Describes Gallery constructor
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var Gallery = function() {
  this.gallery = document.querySelector('.gallery-overlay');
  this.galleryClose = this.gallery.querySelector('.gallery-overlay-close');
  this.galleryImage = this.gallery.querySelector('.gallery-overlay-image');
  this.pictures = [];
  this.activePicture = 0;

  this._show = this._show.bind(this);
  this._hide = this._hide.bind(this);
  this._onGalleryImageClick = this._onGalleryImageClick.bind(this);
};

Gallery.prototype = {
  setPictures: function(pictures) {
    this.pictures = this.pictures.concat(pictures);
  },

  clearPictures: function() {
    this.pictures = [];
  },

  setActivePicture: function(index) {
    this.activePicture = index;
    this.galleryImage.src = this.pictures[index].url;
    this.gallery.querySelector('.likes-count').textContent = this.pictures[index].likes;
    this.gallery.querySelector('.comments-count').textContent = this.pictures[index].comments;
  },

  _onGalleryImageClick: function() {
    if (this.activePicture === this.pictures.length - 1) {
      this.setActivePicture(0);
    } else {
      this.setActivePicture(this.activePicture + 1);
    }
  },

  _show: function(index) {
    this.gallery.classList.remove('invisible');
    this.galleryImage.addEventListener('click', this._onGalleryImageClick);
    this.galleryClose.addEventListener('click', this._hide);
    this.setActivePicture(index);
  },

  _hide: function() {
    this.gallery.classList.add('invisible');
    this.galleryImage.removeEventListener('click', this._onGalleryImageClick);
    this.galleryClose.removeEventListener('click', this._hide);
  }
};

module.exports = new Gallery();
