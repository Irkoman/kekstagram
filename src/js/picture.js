/**
 * @fileoverview Picture constructor
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var gallery = require('./gallery');
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
  this.likes = this.element.querySelector('.picture-comments');

  this._onImageLoad = this._onImageLoad.bind(this);
  this._onImageLoadError = this._onImageLoadError.bind(this);
  this._onImageLoadTimeout = this._onImageLoadTimeout.bind(this);
  this._onImageClick = this._onImageClick.bind(this);
};

utils.inherit(Picture, BaseComponent);

Picture.prototype = {
  IMAGE_LOAD_TIMEOUT: 7000,

  _onImageLoad: function() {
    clearTimeout(this.imageLoadTimeout);
    this.image.removeEventListener('load', this._onImageLoad);
    this.image.removeEventListener('error', this._onImageLoadError);
    this.element.replaceChild(this.image, this.imageElement);
  },

  _onImageLoadError: function() {
    this.image.src = '';
    this.element.classList.add('picture-load-failure');
  },

  _onImageLoadTimeout: function() {
    this.image.src = '';
    this.element.classList.add('picture-load-failure');
  },

  _onImageClick: function(event) {
    event.preventDefault();

    if (!event.target.classList.contains('picture-load-failure')) {
      gallery.show(this.index);
    }
  },

  renderPicture: function() {
    this.image = new Image(182, 182);

    this.image.addEventListener('load', this._onImageLoad);
    this.image.addEventListener('error', this._onImageLoadError);

    this.imageLoadTimeout = setTimeout(this._onImageLoadTimeout, this.IMAGE_LOAD_TIMEOUT);

    this.image.src = this.data.getPictureUrl();
    this.comments.textContent = this.data.getCommentsCount();
    this.likes.textContent = this.data.getLikesCount();

    this.element.addEventListener('click', this._onImageClick);

    return this.element;
  },

  show: function() {
    this.renderPicture();
    BaseComponent.prototype.show.call(this);
  },

  remove: function() {
    clearTimeout(this.imageLoadTimeout);
    this.element.removeEventListener('click', this._onImageClick);
    BaseComponent.prototype.remove.call(this);
  }
};

module.exports = Picture;
