/**
 * @fileoverview
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var load = require('./load');
var gallery = require('./gallery');
var Picture = require('./picture');

module.exports = function() {
  var picturesContainer = document.querySelector('.pictures');
  var filters = document.querySelector('.filters');
  var footer = document.querySelector('.footer');

  /** @constant {number} */
  var PAGE_SIZE = 12;

  /** @constant {number} */
  var THROTTLE_DELAY = 100;

  /** @constant {number} */
  var GAP = 180;

  /** @constant {string} */
  var DATA_LOAD_URL = '/api/pictures';

  /** @constant {string} */
  var DEFAULT_FILTER = 'filter-popular';

  /** @type {string} */
  var activeFilter = DEFAULT_FILTER;

  /** @type {number} */
  var pageNumber = 0;

  /** Прячем блок с фильтрами */
  filters.classList.add('hidden');

  /**
   * @param {Array.<Object>} pictures
   */
  var renderPictures = function(pictures) {
    var container = document.createDocumentFragment();

    pictures.forEach(function(picture, index) {
      var newPicture = new Picture(picture, index);
      container.appendChild(newPicture.element);
    });

    picturesContainer.appendChild(container);
    gallery.setPictures(pictures);
    filters.classList.remove('hidden');
  };

  /**
   * @param {string} filter
   * @param {number} currentPage
   */
  var loadPictures = function(filter, currentPage) {
    load(DATA_LOAD_URL, {
      from: currentPage * PAGE_SIZE,
      to: currentPage * PAGE_SIZE + PAGE_SIZE,
      filter: filter
    }, renderPictures);
  };

  /**  Обработчик кликов по фильтрам */
  var setFiltersEnabled = function() {
    filters.addEventListener('change', function(event) {
      if (event.target.name === 'filter') {
        gallery.clearPictures();
        picturesContainer.innerHTML = '';
        pageNumber = 0;
        activeFilter = event.target.id;
        loadPictures(activeFilter, pageNumber);
      }
    }, true);
  };

  var isFooterVisible = function() {
    return (footer.getBoundingClientRect().top - window.innerHeight) <= GAP;
  };

  var setScrollEnabled = function() {
    var lastCall = Date.now();

    /** Обработчик прокрутки */
    window.addEventListener('scroll', function() {
      if (Date.now() - lastCall >= THROTTLE_DELAY) {
        if (isFooterVisible()) {
          loadPictures(activeFilter, ++pageNumber);
        }
        lastCall = Date.now();
      }
    });
  };

  loadPictures(DEFAULT_FILTER, pageNumber);
  setFiltersEnabled();
  setScrollEnabled();
};
