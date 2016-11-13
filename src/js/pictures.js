/**
 * @fileoverview
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var load = require('./load');
var Picture = require('./picture');
var gallery = require('./gallery');
var throttle = require('./throttle');

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

    pictures.forEach(function(picture, index) {
      var newPicture = new Picture(picture, pageNumber * PAGE_SIZE + index);
      container.appendChild(newPicture.element);
    });

    picturesContainer.appendChild(container);
    gallery.setPictures(pictures);
    document.getElementById(activeFilter).checked = true;
    filters.classList.remove('hidden');

    /**
     * После того, как часть фотографий отрендерилась, можем узнать
     * высоту контейнера и вызвать загрузку следующей страницы,
     * если экран ещё не заполнен
     */
    if (picturesContainer.getBoundingClientRect().height < window.innerHeight + GAP) {
      loadPictures(activeFilter, ++pageNumber);
    }
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
        localStorage.setItem('filter', activeFilter);
        loadPictures(activeFilter, pageNumber);
      }
    }, true);
  };

  var isFooterVisible = function() {
    return (footer.getBoundingClientRect().top - window.innerHeight) <= GAP;
  };

  /** Обработчик прокрутки */
  var setScrollEnabled = function() {
    var optimizedScroll = throttle(function() {
      if (isFooterVisible()) {
        loadPictures(activeFilter, ++pageNumber);
      }
    }, THROTTLE_DELAY);

    window.addEventListener('scroll', optimizedScroll);
  };

  loadPictures(DEFAULT_FILTER, pageNumber);
  setFiltersEnabled();
  setScrollEnabled();
};
