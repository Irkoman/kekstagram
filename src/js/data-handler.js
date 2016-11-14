/**
 * @fileoverview Конструктор объекта для работы с данными
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var DataHandler = function(data) {
  this.data = data;
  this.liked = false;
};

DataHandler.prototype = {
  getPictureUrl: function() {
    return this.data.url;
  },

  getCommentsCount: function() {
    return this.data.comments;
  },

  getLikesCount: function() {
    return this.data.likes;
  },

  getCreationDate: function() {
    return new Date(this.data.created);
  },

  getLikesStatus: function() {
    return this.liked;
  },

  setLikesCountUp: function() {
    this.data.likes++;
    this.liked = true;

    if (typeof this.onLikesChange === 'function') {
      this.onLikesChange(this);
    }

    return this.data.likes;
  },

  setLikesCountDown: function() {
    this.data.likes--;
    this.liked = false;

    if (typeof this.onLikesChange === 'function') {
      this.onLikesChange(this);
    }

    return this.data.likes;
  }
};

module.exports = DataHandler;
