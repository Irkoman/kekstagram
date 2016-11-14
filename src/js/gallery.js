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
  this.galleryLikes = this.gallery.querySelector('.likes-count');
  this.galleryComments = this.gallery.querySelector('.comments-count');
  this.activePicture = 0;
  this.pictures = [];

  this._hide = this._hide.bind(this);
  this._onGalleryImageClick = this._onGalleryImageClick.bind(this);
  this._onGalleryLikesClick = this._onGalleryLikesClick.bind(this);
  this._onEscapeButtonClick = this._onEscapeButtonClick.bind(this);
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
    var activePictureData = this.pictures[index];
    this.activePicture = index;
    this.galleryImage.src = activePictureData.getPictureUrl();
    this.galleryLikes.textContent = activePictureData.getLikesCount();
    this.galleryComments.textContent = activePictureData.getCommentsCount();
    this.galleryLikes.classList.toggle('likes-count-liked', activePictureData.getLikesStatus());
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

  _onGalleryLikesClick: function(event) {
    if (event.target === this.galleryLikes) {
      var activePictureData = this.pictures[this.activePicture];

      var likesCount = (activePictureData.getLikesStatus()) ?
        activePictureData.setLikesCountDown() :
        activePictureData.setLikesCountUp();

      this.galleryLikes.textContent = likesCount;
      this.galleryLikes.classList.toggle('likes-count-liked', activePictureData.getLikesStatus());
    }
  },

  _onEscapeButtonClick: function(event) {
    if (event.keyCode === 27) {
      this._hide();
    }
  },

  show: function(index) {
    this.gallery.classList.remove('invisible');
    this.galleryImage.addEventListener('click', this._onGalleryImageClick);
    this.galleryLikes.addEventListener('click', this._onGalleryLikesClick);
    this.galleryClose.addEventListener('click', this._hide);
    this.setActivePicture(index);
    document.addEventListener('keydown', this._onEscapeButtonClick);
  },

  _hide: function() {
    this.gallery.classList.add('invisible');
    this.galleryImage.removeEventListener('click', this._onGalleryImageClick);
    this.galleryLikes.removeEventListener('click', this._onGalleryLikesClick);
    this.galleryClose.removeEventListener('click', this._hide);
    document.removeEventListener('keydown', this._onEscapeButtonClick);
  },

  remove: function() {
    this._hide();
    BaseComponent.prototype.remove.call(this);
  }
};

module.exports = new Gallery();
