// tests/lib/config/index.js

var env;

try {
  env = process.env;
} catch(err) {
  var system = require('system');
  env = system.env;
}

module.exports = {
  log_level: env.LOG_LEVEL || 'INFO',
  tests_root: (
    env.TESTS_ROOT || './tests/lib/tasks'
  ),
  phantom: {
    log: {
      tail_size: 20,
    },
    url: 'http://localhost:1507',
    page: {
      width: 1024,
      height: 800
    },
    shims: './tests/lib/humgat/shims.js',

    screenshots: {
      path: './tests/screenshots',
      etalon: './tests/etalon-screenshots'
    },

    npmStart: {
      startLine: 'webpack: bundle is now VALID',
      stopLine: 'Module not found: Error'
    }
  }
};
