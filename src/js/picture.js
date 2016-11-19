/**
 * @fileoverview Picture constructor
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var BaseComponent = require('./base-component');
var utils = require('./utils');

var template = document.getElementById('picture-template');
var templateContainer = 'content' in template ? template.content : template;

var Picture = function(data, index) {
  this.element = templateContainer.querySelector('.picture').cloneNode(true);
  BaseComponent.call(this, this.element);

  this.data = data;
  this.index = index;
  this.imageLoadTimeout = null;
  this.imageElement = this.element.querySelector('img');
  this.comments = this.element.querySelector('.picture-comments');
  this.likes = this.element.querySelector('.picture-likes');

  this._onImageLoad = this._onImageLoad.bind(this);
  this._onImageLoadError = this._onImageLoadError.bind(this);
  this._onImageLoadTimeout = this._onImageLoadTimeout.bind(this);
  this._onImageClick = this._onImageClick.bind(this);
  this._onLikesClick = this._onLikesClick.bind(this);
};

utils.inherit(Picture, BaseComponent);

Picture.prototype = {
  IMAGE_LOAD_TIMEOUT: 7000,

  _onImageLoad: function() {
    clearTimeout(this.imageLoadTimeout);
    this.element.replaceChild(this.image, this.imageElement);
    this.image.removeEventListener('load', this._onImageLoad);
    this.image.removeEventListener('error', this._onImageLoadError);
  },

  _onImageLoadError: function() {
    this.image.src = '';
    this.element.classList.add('picture-load-failure');
    this.image.removeEventListener('load', this._onImageLoad);
    this.image.removeEventListener('error', this._onImageLoadError);
  },

  _onImageLoadTimeout: function() {
    this.image.src = '';
    this.element.classList.add('picture-load-failure');
    this.image.removeEventListener('load', this._onImageLoad);
    this.image.removeEventListener('error', this._onImageLoadError);
  },

  _onImageClick: function(event) {
    event.preventDefault();

    if (!event.target.classList.contains('picture-load-failure')) {
      location.hash = '#photo/photos/' + this.image.src.split('photos/')[1];
    }
  },

  _onLikesClick: function(dataHandler) {
    this.likes.textContent = dataHandler.getLikesCount();
  },

  renderPicture: function() {
    this.image = new Image(182, 182);

    this.image.addEventListener('load', this._onImageLoad);
    this.image.addEventListener('error', this._onImageLoadError);

    this.imageLoadTimeout = setTimeout(this._onImageLoadTimeout, this.IMAGE_LOAD_TIMEOUT);

    this.image.src = this.data.getPictureUrl();
    this.comments.textContent = this.data.getCommentsCount();
    this.likes.textContent = this.data.getLikesCount();

    this.data.onLikesChange = this._onLikesClick;
    this.element.addEventListener('click', this._onImageClick);

    return this.element;
  },

  show: function() {
    this.renderPicture();
    BaseComponent.prototype.show.call(this);
  },

  remove: function() {
    clearTimeout(this.imageLoadTimeout);
    this.data.onLikesChange = null;
    this.element.removeEventListener('click', this._onImageClick);
    this.image.removeEventListener('load', this._onImageLoad);
    this.image.removeEventListener('error', this._onImageLoadError);
    BaseComponent.prototype.remove.call(this);
  }
};

module.exports = Picture;
