// tests/lib/tasks/module2-task1/phantom-test.js

'use strict';

var humgat = require('../../humgat').create();
require('../../humgat/common')(humgat);

humgat.on('page.open.success', function() {
  var page = this.getPage();

  this.title = 'Canvas';

  this.emit('page.cleanup');

  page.uploadFile('label.upload-file', './src/photos/1.jpg');

  setTimeout(this.emit.bind(this, 'picture.uploaded'), 500);
}).on('page.cleanup', function() {
  var page = this.getPage();

  page.evaluate(function() {
    var elements = document.querySelectorAll('body > *');
    var element;

    for(var i = 0; i < elements.length; i += 1) {
      element = elements[i];

      if(element.className === 'upload') {
        //
      } else {
        element.style.display = 'none';
      }
    }
  });
}).on('picture.uploaded', function() {
  var dom = this.dom;

  dom.css('canvas', {left: '0px', top: '0px'});
  dom.css('.upload-form-controls, .upload-resize-controls', {
    display: 'none'
  });

  this.cliprect(264, 5, 602, 598);

  this.screenshot.assertSamePicture('Скриншот после загрузки');
  this.emit('suite.done');
}).run();
