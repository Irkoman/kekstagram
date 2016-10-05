// tests/lib/humgat/asserts/screenshot.js

var Screenshot = module.exports = function Screenshot(humgat, screenshotsPath) {
  this.humgat = humgat;
  this.path = screenshotsPath;

  this.screenshotId = 1;
};

var sp = Screenshot.prototype;

sp.assertSamePicture = function(message, treshold) {

  var humgat = this.humgat;
  var page = humgat.getPage();

  var screenshotFilePath = this.path + '/screenshot-' + this.screenshotId + '.png';

  if(typeof (treshold) === 'undefined') {
    treshold = 99.99;
  }

  page.render(screenshotFilePath);

  humgat.addResult({
    title: message,
    result: 'PENDING',
    type: 'SCREENSHOT',
    path: screenshotFilePath,
    treshold: treshold
  });

  this.screenshotId += 1;

  humgat.hasScreenshots = true;
};
