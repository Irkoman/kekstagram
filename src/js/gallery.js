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

  this._show = this._show.bind(this);
  this._hide = this._hide.bind(this);
  this._remove = this._remove.bind(this);
  this._restoreFromHash = this._restoreFromHash.bind(this);
  this._onHashChange = this._onHashChange.bind(this);
  this._setActivePicture = this._setActivePicture.bind(this);
  this._onGalleryImageClick = this._onGalleryImageClick.bind(this);
  this._onGalleryLikesClick = this._onGalleryLikesClick.bind(this);
  this._onEscapeButtonClick = this._onEscapeButtonClick.bind(this);

  window.addEventListener('hashchange', this._onHashChange);
};

utils.inherit(Gallery, BaseComponent);

Gallery.prototype = {
  setPictures: function(pictures) {
    this.pictures = this.pictures.concat(pictures);
  },

  clearPictures: function() {
    this.pictures = [];
  },

  _setActivePicture: function(index) {
    if (typeof index === 'string') {
      for (var i = 0; i < this.pictures.length; i++) {
        if (this.pictures[i].data.url === index) {
          this.activePicture = i;
        }
      }
    } else {
      this.activePicture = index;
    }

    var activePictureData = this.pictures[this.activePicture];
    this.galleryImage.src = activePictureData.getPictureUrl();
    this.galleryLikes.textContent = activePictureData.getLikesCount();
    this.galleryComments.textContent = activePictureData.getCommentsCount();
    this.galleryLikes.classList.toggle('likes-count-liked', activePictureData.getLikesStatus());
  },

  _onGalleryImageClick: function(event) {
    if (event.target === this.galleryImage) {
      if (this.activePicture === this.pictures.length - 1) {
        this._setActivePicture(0);
        location.hash = '#photo/photos/' + this.galleryImage.src.split('photos/')[1];
      } else {
        this._setActivePicture(++this.activePicture);
        location.hash = '#photo/photos/' + this.galleryImage.src.split('photos/')[1];
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
      location.hash = '';
    }
  },

  _restoreFromHash: function() {
    var hash = location.hash.match(/#photo\/(\S+)/);

    if (hash) {
      this._setActivePicture(hash[1]);
      this._show(this.activePicture);
    } else {
      this._hide();
    }
  },

  _onHashChange: function() {
    this._restoreFromHash();
  },

  _show: function(index) {
    this.gallery.classList.remove('invisible');
    this.galleryImage.addEventListener('click', this._onGalleryImageClick);
    this.galleryLikes.addEventListener('click', this._onGalleryLikesClick);
    this.galleryClose.addEventListener('click', this._hide);
    this._setActivePicture(index);
    document.addEventListener('keydown', this._onEscapeButtonClick);
  },

  _hide: function() {
    location.hash = '';
    this.gallery.classList.add('invisible');
    this.galleryImage.removeEventListener('click', this._onGalleryImageClick);
    this.galleryLikes.removeEventListener('click', this._onGalleryLikesClick);
    this.galleryClose.removeEventListener('click', this._hide);
    document.removeEventListener('keydown', this._onEscapeButtonClick);
  },

  _remove: function() {
    this._hide();
    BaseComponent.prototype.remove.call(this);
  }
};

module.exports = Gallery;
