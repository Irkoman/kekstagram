// tests/lib/tasks/module5-task1/node-test.js
var path = require('path');
var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var querystring = require('querystring');

var NodeTestCase = require('../../basic/node-test-case.js')

var require_js = function(moduleName) {
  return require(
    path.resolve(
      path.join('./src/js', moduleName)
    )
  );
};

var indexHtml = `
<html><body>
  <div class='pictures'></div>
  <template id="picture-template" style="display: none">
    <a href="" class="picture">
      <img src="" width="182" height="182">
      <span class="picture-stats">
        <span class="picture-stat picture-comments"></span>
        <span class="picture-stat picture-likes"></span>
      </span>
    </a>
  </template>
</body></html>
`;

var picturesData = [{
  "likes": 40,
  "comments": 12,
  "url": "photos/1.jpg"
}, {
  "likes": 125,
  "comments": 49,
  "url": "photos/2.jpg"
}, {
  "likes": 350,
  "comments": 20,
  "url": "failed.jpg"
}, {
  "likes": 61,
  "comments": 0,
  "url": "photos/4.jpg"
}, {
  "likes": 100,
  "comments": 18,
  "url": "photos/5.jpg"
}];

module.exports = function testModule5Task1() {
  var testCase = new NodeTestCase('module5-task1', {
    title: 'Больше модулей',

    runAsserts: function() {
      this._withJSDOM(this._runLoadAsserts);
      this._withJSDOM(this._runTemplateAsserts);
      this._withJSDOM(this._runPicturesAsserts);
    },

    _runLoadAsserts: function() {
      var testCase = this;

      var load = require_js('load');

      this.addPromise(function(resolve) {
        var stopTimeout = setTimeout(function() {
          testCase.assert(false, 'load: Не удаётся загрузить JSONP');
          resolve();
        }, 1000);

        load('http://localhost:1507/api/pictures', function(data) {

          clearTimeout(stopTimeout);

          testCase.assertEqual(
            data.length, picturesData.length,
            'load: Данные загружены'
          );

          for(var i = 0; i < Math.min(data.length, picturesData.length); ++i) {
            testCase.assertEqual(
              data[i].likes, 
              picturesData[i].likes,
              'load: Сравниваем количество лайков #' + (i + 1)
            );

            testCase.assertEqual(
              data[i].comments, 
              picturesData[i].comments,
              'load: Сравниваем количество комментариев #' + (i + 1)
            );
          }

          resolve();
        });
      });
    },

    _withJSDOM: function(cb) {

      var jsdom = require('jsdom');
      var testCase = this;

      jsdom.env({
        html: indexHtml,
        url: 'http://localhost:1507',
        done: function(err, window) {
          var saveDoc = global.document;
          var saveWin = global.window;
          var saveImg = global.Image;

          global.document = window.document;
          global.window = window;
          global.Image = window.Image;

          var result = cb.call(testCase);

          if(result instanceof Promise) {
            result.then(function() {
              global.document = saveDoc;
              global.window = saveWin;
              global.Image = saveImg;
            });
          } else {
            // restore
            global.document = saveDoc;
            global.window = saveWin;
            global.Image = saveImg;
          }
        },
        features: {
          FetchExternalResources: ["script"]
        },
        resourceLoader: function(resource, callback) {
          var pathname = resource.url.pathname;
          var query = resource.url.query;
          var opts = querystring.parse(query);

          if(pathname === '/api/pictures') {
            // var cbName = query.split('=')[1];
            var cbName = opts.callback;

            callback(null, cbName + '(' + JSON.stringify(picturesData) + ')');
          } else {
            return resource.defaultFetch(callback);
          }
        }
      });
    },

    _runTemplateAsserts: function() {
      var getTemplateElement = require_js('picture');

      var $el = getTemplateElement({
        likes: 42,
        comments: 38,
        url: 'photos/31.jpg'
      });

      this.assert(
        $el,
        'picture: На выходе должен получиться DOM-узел'
      );

      this.assert(
        function() {
          return ($el.querySelector('.picture-likes').textContent === '42');
        },
        'picture: В узел .picture-likes должно попасть число 42'
      );

      this.assert(
        function() {
          return ($el.querySelector('.picture-comments').textContent === '38');
        },
        'picture: В узел .picture-comments должно попасть число 38'
      );
    },

    _runPicturesAsserts: function() {
      var testCase = this;

      require_js('pictures'); // Just load pictures..

      return this.addPromise(function(resolve) {
        setTimeout(function() {
          // Wait until pictures are loaded
          //   and DOM is modified
          var pictureNodes = document.querySelectorAll('.pictures > *');

          testCase.assertEqual(
            pictureNodes.length, picturesData.length,
            'pictures: Загружены и добавлены все картинки'
          );

          for(var i = 0; i < Math.min(pictureNodes.length, picturesData.length); ++i) {
            testCase.assertEqual(
              pictureNodes[i].querySelector('.picture-likes').textContent, 
              '' + picturesData[i].likes,
              'pictures: Сравниваем количество лайков #' + (i + 1)
            );

            testCase.assertEqual(
              pictureNodes[i].querySelector('.picture-comments').textContent,
              '' + picturesData[i].comments,
              'pictures: Сравниваем количество комментариев #' + (i + 1)
            );
          }

          resolve();
        }, 1000);
      });
    }
  });

  return testCase.run();
};