'use strict';

var devServerPort = 8081;
var specE2eFiles = 'spec-e2e/**/*.js';
/* global exports */
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [specE2eFiles],
  multiCapabilities: [{'browserName': 'firefox'}, {'browserName': 'chrome'}],
  //capabilities: {'browserName': 'firefox'},
  baseUrl: 'http://localhost:' + devServerPort
};
