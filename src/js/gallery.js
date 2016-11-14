/**
 * @fileoverview Describes Gallery constructor
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var BaseComponent = require('./base-component');
var utils = require('./utils');

var Gallery = function() {
  this.gallery = document.querySelector('.gallery-overlay');
  BaseComponent.call(this, this.gallery);

  this.galleryClose = this.gallery.querySelector('.gallery-overlay-close');
  this.galleryImage = this.gallery.querySelector('.gallery-overlay-image');
  this.pictures = [];
  this.activePicture = 0;

  this._hide = this._hide.bind(this);
  this._onGalleryImageClick = this._onGalleryImageClick.bind(this);
};

utils.inherit(Gallery, BaseComponent);

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

  _onGalleryImageClick: function(event) {
    if (event.target === this.galleryImage) {
      if (this.activePicture === this.pictures.length - 1) {
        this.setActivePicture(0);
      } else {
        this.setActivePicture(this.activePicture + 1);
      }
    }
  },

  show: function(index) {
    this.gallery.classList.remove('invisible');
    this.galleryImage.addEventListener('click', this._onGalleryImageClick);
    this.galleryClose.addEventListener('click', this._hide);
    this.setActivePicture(index);
  },

  _hide: function() {
    this.gallery.classList.add('invisible');
    this.galleryImage.removeEventListener('click', this._onGalleryImageClick);
    this.galleryClose.removeEventListener('click', this._hide);
  },

  remove: function() {
    this._hide();
    BaseComponent.prototype.remove.call(this);
  }
};

module.exports = new Gallery();
