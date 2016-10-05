// tests/lib/tasks/module1-task2/phantom-test.js

var humgat = require('../../humgat').create();
require('../../humgat/common')(humgat);

/*
  Этот тест должен проверить, что в загруженной странице
  определена функция getMessage
*/

humgat.on('page.open.success', function() {
  this.title = 'Начинаем программировать';

  this.dom.assertEqual(
    'function', // expected value
    function() { return typeof (getMessage); },
    'Функция `getMessage` должна быть определена'
  );

  this.emit('suite.done');
}).run();
