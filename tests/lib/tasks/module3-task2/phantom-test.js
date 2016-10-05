// tests/lib/tasks/module3-task2/phantom-test.js

'use strict';

var humgat = require('../../humgat').create();
require('../../humgat/common')(humgat);

var photo = {
  width: 600,
  height: 600
};

var maxAvailSide = Math.min(photo.width, photo.height);
var validSide = maxAvailSide * 0.8;

var selector = {
  fileUpload: 'label.upload-file',
  x: '#resize-x',
  y: '#resize-y',
  size: '#resize-size',
  fwd: '#resize-fwd',
  filterSepia: '.upload-filter-label-sepia'
};

var validateExpirationDate = function(dateString) {
  var date = new Date(dateString);
  var now = new Date();
  var year = now.getFullYear();
  var graceHopperBirthDay = new Date(year, 11, 9);

  if(now < graceHopperBirthDay) {
    graceHopperBirthDay = new Date(year - 1, 11, 9);
  }

  var msPerDay = 24 * 3600 * 1000;

  var daysFromBD = Math.floor((now - graceHopperBirthDay) / msPerDay);
  var daysToExpire = Math.floor((date - now) / msPerDay);

  return Math.abs(daysFromBD - daysToExpire) < 2;
};

humgat.on('page.open.success', function() {
  var page = this.getPage();

  this.title = 'Cookies';

  page.uploadFile(selector.fileUpload, './src/photos/1.jpg');

  setTimeout(this.emit.bind(this, 'picture.uploaded'), 300);
}).on('picture.uploaded', function() {
  var page = this.getPage();

  this.emit('submit.resized.picture');

  this.dom.click(selector.filterSepia);

  this.off('page.open.success');

  this.on('page.loaded', (function() {
    this.emit('page.open.second-time');
  }).bind(this));

  page.reload();
}).on('submit.resized.picture', function() {
  var dom = this.dom;

  dom.fillIn(selector.x, 0);
  dom.fillIn(selector.y, 0);
  dom.fillIn(selector.size, validSide);

  // Закрывают кнопку "fwd"
  dom.css('canvas', { display: 'none'});
  dom.css('.upload-resize-controls', { display: 'none' });

  dom.click(selector.fwd);
}).on('page.open.second-time', function() {
  var page = this.getPage();

  page.uploadFile(selector.fileUpload, './src/photos/1.jpg');

  setTimeout(this.emit.bind(this, 'picture.uploaded-2'), 300);
}).on('picture.uploaded-2', function() {

  this.emit('submit.resized.picture');

  this.assertEqual(
    'sepia',
    this.getCookie('upload-filter').value,
    'Cookie должна иметь значение `sepia`'
  );

  this.dom.assertEqual(
    'sepia',
    function() {
      var form = document.querySelector('.upload-filter');
      var radio = form.elements['upload-filter'];

      return radio.value;
    },
    'Фильтр должен иметь значение `sepia`'
  );

  this.assertEqual(
    true,
    validateExpirationDate(this.getCookie('upload-filter').expires),
    'Дата уничтожения cookie должна быть выставлена правильно'
  );

  this.emit('suite.done');
}).run();
