'use strict';

window.getMessage = function(a, b) {
  if (typeof a === 'boolean') {
    if (a) {
      return 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
    } else {
      return 'Переданное GIF-изображение не анимировано';
    }
  }

  if (typeof a === 'number') {
    return 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + b * 4 + ' атрибутов';
  }

  if (Array.isArray(a) && !Array.isArray(b)) {
    var amountOfRedPoints = a.reduce(function(x, y) {
      return x + y;
    });
    return 'Количество красных точек во всех строчках изображения: ' + amountOfRedPoints;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    var artifactsSquare = 0;

    for (var i = 0; i < a.length && i < b.length; i++) {
      artifactsSquare += a[i] * b[i];
    }
    return 'Общая площадь артефактов сжатия: ' + artifactsSquare + ' пикселей';
  }

  return 'Переданы некорректные данные';
};
