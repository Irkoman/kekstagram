// tests/lib/utils/parameters.js

var fs = require('fs');
var execSync = require('child_process').execSync;

var getLocalBranchName = function() {
  return execSync('git rev-parse --abbrev-ref HEAD').toString();
};

var getTravisBranchName = function() {
  return process.env.GITHUB_BRANCH;
};

var parameters = module.exports = {
  getBranchName: function() {
    var branchName = 'master';

    if(process.env.TRAVIS === 'true') {
      branchName = getTravisBranchName();
    } else {
      branchName = getLocalBranchName();
    }

    return branchName.trim();
  },
  parseBranchName: function(branchName) {
    var RE = /module(\d+)-task(\d+)/;
    var md = RE.exec(branchName);

    if(md) {
      return { module: +md[1], task: +md[2] };
    } else {
      return { module: 0, task: 0 };
    }
  }
};
