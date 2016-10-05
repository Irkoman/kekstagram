'use strict';

const getPage = require('./get-page');
const filter = require('./filter');
const fs = require('fs');
const path = require('path');


const twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000;


const getRandTimestampInRange = (range) => {
  return Date.now() - parseInt(Math.random() * range);
};


const preprocessRec = (timestamp, rec) => {
  return Object.assign({created: timestamp}, rec);
};


let preprocessedData = null;


module.exports = {
  read: (filterID, from, to, callback) => {
    return new Promise((resolve, reject) => {
      //If callback passed, then make jsonp
      from = typeof from === 'undefined' ? -Infinity : from;
      to = typeof to === 'undefined' ? Infinity : to;

      fs.readFile(path.resolve(__dirname, 'data.json'), 'utf-8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          data = JSON.parse(data);

          // NB! Решение проблемы с устареванием данных: данные регенерируются каждый
          // раз заново при первом запросе к серверу и используются в течение всей
          // сессии. Даты проставляются случайным образом в рамках двух недель.
          // Может быть проблема решится, если перенести данные на общий сервер
          // и дописать проекты так, чтобы работали формы и все, что вводят студенты
          // не пропадало
          if (!preprocessedData) {
            console.log('Первый запрос к серверу, генерируем случайный набор даных...');
            preprocessedData = data.map(rec => preprocessRec(getRandTimestampInRange(twoWeeks), rec));
            console.log('Готово. Данные будут создаваться заново каждый раз при перезапуске сервера.');
          }

          var filteredData = filter(preprocessedData, filterID);
          var pageData = getPage(filteredData, from, to);
          if (callback) {
            // pretty print, maybe issues in some browser.
            var body = JSON.stringify(pageData, null, 2);
            // the /**/ is a specific security mitigation for "Rosetta Flash JSONP abuse"
            pageData = '/**/ ' + callback + '(' + body + ');'
          }
          resolve(pageData);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
};
