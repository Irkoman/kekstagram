// tests/lib/tasks/module3-task1/phantom-test.js

'use strict';

var humgat = require('../../humgat').create();
require('../../humgat/common')(humgat);

var photo = {
  width: 600,
  height: 600
};

var maxAvailSide = Math.min(photo.width, photo.height);
var validSide = maxAvailSide * 0.8;
var tooBigSide = maxAvailSide * 1.2;

var selector = {
  fileUpload: 'label.upload-file',
  x: '#resize-x',
  y: '#resize-y',
  size: '#resize-size',
  fwd: '#resize-fwd'
};

humgat.title = 'Валидация';

humgat.on('page.open.success', function() {
  var page = this.getPage();

  this.title = 'Валидация';

  page.uploadFile(selector.fileUpload, './src/photos/1.jpg');

  setTimeout(this.emit.bind(this, 'picture.uploaded'), 500);
}).on('picture.uploaded', function() {
  this.dom.css('canvas', { display: 'none' });

  this.emit('validate.testcase',
    0, 0, validSide, false,
    'Валидные размеры, кнопка не заблокирована'
  );

  this.emit('validate.testcase',
    0, 0, tooBigSide, true,
    'Слишком большой размер, кнопка заблокирована'
  );

  this.emit('validate.testcase',
    validSide, 0, validSide, true,
    'Выпадание справа, кнопка заблокирована'
  );

  this.emit('validate.testcase',
    0, -validSide, validSide, true,
    'Выпадание сверху, кнопка заблокирована'
  );

  this.emit('suite.done');
}).on('validate.testcase', function(x, y, size, disabled, msg) {
  var dom = this.dom;

  dom.fillIn(selector.x, x);
  dom.fillIn(selector.y, y);
  dom.fillIn(selector.size, size);

  dom.assertEqual(
    disabled,
    function() {
      var fwd = document.querySelector('#resize-fwd');

      return !!fwd.disabled;
    },
    msg
  );
}).run();
