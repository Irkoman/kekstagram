/**
 * @fileoverview Конструктор объекта для работы с данными
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var DataHandler = function(data) {
  this.data = data;
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

  setLikesCountUp: function() {
    return this.data.likes++;
  },

  setLikesCountDown: function() {
    return this.data.likes--;
  }
};

module.exports = DataHandler;
