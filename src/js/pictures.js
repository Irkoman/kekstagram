/**
 * @fileoverview
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var load = require('./load');
var Picture = require('./picture');
var DataHandler = require('./data-handler');
var Gallery = require('./gallery');
var utils = require('./utils');

module.exports = function() {
  var picturesContainer = document.querySelector('.pictures');
  var filters = document.querySelector('.filters');
  var footer = document.querySelector('.footer');
  var loadedPictures = [];
  var gallery = new Gallery();

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
  var activeFilter = localStorage.getItem('filter') || DEFAULT_FILTER;

  /** @type {number} */
  var pageNumber = 0;

  /** Прячем блок с фильтрами */
  filters.classList.add('hidden');

  /**
   * @param {Array.<Object>} pictures
   */
  var renderPictures = function(pictures) {
    var container = document.createDocumentFragment();

    pictures = pictures.map(function(picture) {
      return new DataHandler(picture);
    });

    pictures.forEach(function(picture, index) {
      var newPicture = new Picture(picture, pageNumber * PAGE_SIZE + index);
      loadedPictures.push(newPicture);
      container.appendChild(newPicture.renderPicture());
    });

    picturesContainer.appendChild(container);
    gallery.setPictures(pictures);
    gallery._restoreFromHash();
    document.getElementById(activeFilter).checked = true;
    filters.classList.remove('hidden');
  };

  /**
   * @param {string} filter
   */
  var loadPictures = function(filter) {
    load(DATA_LOAD_URL, {
      from: pageNumber * PAGE_SIZE,
      to: pageNumber * PAGE_SIZE + PAGE_SIZE,
      filter: filter
    }, function(data) {
      if (data.length > 0) {
        renderPictures(data);
      }
      if (isNextPageNeeded() && isNextPageAvailable(loadedPictures)) {
        pageNumber++;
        loadPictures(filter);
      }
    });
  };

  /**  Обработчик кликов по фильтрам */
  var setFiltersEnabled = function() {
    filters.addEventListener('change', function(event) {
      if (event.target.name === 'filter') {
        gallery.clearPictures();
        removePictures();
        pageNumber = 0;
        activeFilter = event.target.id;
        localStorage.setItem('filter', activeFilter);
        loadPictures(activeFilter, pageNumber);
      }
    }, true);
  };

  var isNextPageNeeded = function() {
    return (footer.getBoundingClientRect().top - window.innerHeight) <= GAP ||
      (picturesContainer.getBoundingClientRect().height - window.innerHeight <= GAP);
  };

  var isNextPageAvailable = function(data) {
    return pageNumber < Math.floor(data.length / PAGE_SIZE);
  };

  /** Обработчик прокрутки */
  var setScrollEnabled = function() {
    var optimizedScroll = utils.throttle(function() {
      if (isNextPageNeeded()) {
        loadPictures(activeFilter, ++pageNumber);
      }
    }, THROTTLE_DELAY);

    window.addEventListener('scroll', optimizedScroll);
  };

  var removePictures = function() {
    loadedPictures.forEach(function(picture) {
      picture.remove();
    });

    loadedPictures = [];
  };

  loadPictures(activeFilter, pageNumber);
  setFiltersEnabled();
  setScrollEnabled();
};
