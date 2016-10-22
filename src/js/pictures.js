/**
 * @fileoverview
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

(function() {
  var DATA_LOAD_URL = 'http://localhost:1507/api/pictures';

  /**
   * Функция для выполнения JSONP-запросов. Название коллбэка
   * опционально (если не передано, генерируется случайное).
   * @param {string} url
   * @param {function} callback
   * @param {string} callbackName
   */
  var loadData = function(url, callback, callbackName) {
    if (!callbackName) {
      callbackName = 'callback' + Date.now();
    }

    window[callbackName] = function(data) {
      callback(data);
    };

    /**
     * С помощью тега <script> делаем запрос
     * к скрипту с данными на сервере
     */
    var script = document.createElement('script');
    script.src = url + '?callback=' + callbackName;
    document.body.appendChild(script);
  };

  /**
   * Прячем блок с фильтрами
   */
  var filters = document.querySelector('.filters');
  filters.classList.add('hidden');

  var container = document.querySelector('.pictures');
  var template = document.getElementById('picture-template');
  var templateContainer = 'content' in template ? template.content : template;
  var templateElement = templateContainer.querySelector('.picture');

  /**
   * Время, отведённое на ожидание загрузки фотографии
   * @const
   * @type {number}
   */
  var PHOTO_LOAD_TIMEOUT = 10000;

  /**
   * Создание блока фотографии на основе шаблона
   */
  var getPictureElement = function(picture) {
    var pictureElement = templateElement.cloneNode(true);

    pictureElement.querySelector('.picture-likes').textContent = picture.likes;
    pictureElement.querySelector('.picture-comments').textContent = picture.comments;

    /**
     * Изображениям добавляются обработчики загрузки и ошибки
     */
    var photo = new Image(182, 182);
    var photoTimeout = null;

    photo.onload = function() {
      clearTimeout(photoTimeout);
      var img = pictureElement.querySelector('img');
      img.src = picture.url;
    };

    photo.onerror = function() {
      pictureElement.classList.add('picture-load-failure');
    };

    photo.src = picture.url;

    photoTimeout = setTimeout(function() {
      pictureElement.classList.add('picture-load-failure');
    }, PHOTO_LOAD_TIMEOUT);

    return pictureElement;
  };

  /**
   * Функция создаёт элемент для каждой записи массива pictures
   * и выводит его на страницу.
   * @param {Object[]} pictures
   */
  var renderPictures = function(pictures) {
    pictures.forEach(function(picture) {
      var newPictureElement = getPictureElement(picture);
      container.appendChild(newPictureElement);
    });
  };

  /**
   * Загрузка данных (после которой вызывается функция
   * для отрисовки фотографий) и показ блока с фильтрами
   */
  loadData(DATA_LOAD_URL, renderPictures, 'getPictures');
  filters.classList.remove('hidden');
})();
