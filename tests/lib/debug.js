var config = require('./config');

var displayDebugInfo = module.exports = function() {
  console.log('----- CONFIG -----');
  console.log(JSON.stringify(config, null, 2));
  // console.log('----- ENV -----');
  // console.log(JSON.stringify(process.env, null, 2));
};
