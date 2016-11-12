/* global Resizer: true */
/* global Cookies: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

module.exports = function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /** @type {Object.<string, string>} */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  var cleanupResizer = function() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  };

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  var updateBackground = function() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  };

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /** @type {HTMLImageElement} */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /** @type {HTMLElement} */
  var uploadMessage = document.querySelector('.upload-message');

  /**  Переменные для валидации формы кадрирования */
  var xField = resizeForm.elements.x;
  var yField = resizeForm.elements.y;
  var sideField = resizeForm.elements.size;
  var resizeControls = document.querySelector('.upload-resize-controls');
  var submitButton = resizeForm.elements.fwd;

  /**
   * Установка минимальных значений для полей
   */
  xField.min = 0;
  yField.min = 0;
  sideField.min = 30;

  window.addEventListener('resizerchange', function() {
    var constraint = currentResizer.getConstraint();

    xField.value = constraint.x;
    yField.value = constraint.y;
    sideField.value = constraint.side;
  });

  resizeControls.addEventListener('input', function() {
    var xValue = parseInt(xField.value, 10);
    var yValue = parseInt(yField.value, 10);
    var sizeValue = parseInt(sideField.value, 10);

    currentResizer.setConstraint(xValue, yValue, sizeValue);
  }, true);

  /**
   * Функция, проверяющая данные на валидность
   * @return {boolean}
   */
  var resizeFormIsValid = function() {
    var imageWidth = currentResizer._image.naturalWidth;
    var imageHeight = currentResizer._image.naturalHeight;

    var isValid = (+xField.value + +sideField.value <= +imageWidth) &&
                  (+yField.value + +sideField.value <= +imageHeight) &&
                  (+xField.value >= 0) && (+yField.value >= 0);

    submitButton.disabled = !isValid;
    return isValid;
  };

  /**
   * Переключатель для атрибута disabled кнопки отправки формы
   */
  function toggleSubmitButton() {
    submitButton.disabled = !resizeFormIsValid();
  }

  /**
   * Делегирование вместо установки обработчика на каждый input
   */
  resizeControls.addEventListener('input', function(event) {
    event.preventDefault();
    if (event.target.type === 'number') {
      toggleSubmitButton();
    }
  }, true);

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  var showMessage = function(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  };

  var hideMessage = function() {
    uploadMessage.classList.add('invisible');
  };

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} event
   */
  uploadForm.addEventListener('change', function(event) {
    var element = event.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        });

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если формат загружаемого файла не поддерживается
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} event
   */
  resizeForm.addEventListener('reset', function(event) {
    event.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} event
   */
  resizeForm.addEventListener('submit', function(event) {
    event.preventDefault();

    if (resizeFormIsValid()) {
      var image = currentResizer.exportImage().src;

      var thumbnails = filterForm.querySelectorAll('.upload-filter-preview');
      for (var i = 0; i < thumbnails.length; i++) {
        thumbnails[i].style.backgroundImage = 'url(' + image + ')';
      }

      filterImage.src = image;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });


  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} event
   */
  filterForm.addEventListener('reset', function(event) {
    event.preventDefault();

    /**
     * Если в куках есть фильтр, он устанавливается по дефолту
     */
    var selectedFilter = Cookies.get('upload-filter');
    if (selectedFilter) {
      filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
    }

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} event
   */
  filterForm.addEventListener('submit', function(event) {
    event.preventDefault();

    var filterChecked = document.querySelector('input[name="upload-filter"]:checked');
    Cookies.set('upload-filter', filterChecked.value, { expires: computeDateToExpire() });

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Функция высчитывает количество дней с последнего прошедшего дня рождения
   * Грейс Хоппер и в соответствии с ним назначает dateToExpire для куки
   */
  function computeDateToExpire() {
    var today = new Date();
    var birthdayOfGraceHopper = new Date(today.getFullYear(), 11, 9);

    if (today < birthdayOfGraceHopper) {
      birthdayOfGraceHopper = new Date(today.getFullYear() - 1, 11, 9);
    }

    var dateToExpire = +today + (today - birthdayOfGraceHopper);
    return new Date(dateToExpire);
  }

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap, соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia',
        'marvin': 'filter-marvin'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  cleanupResizer();
  updateBackground();
};
