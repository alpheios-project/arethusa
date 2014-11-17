'use strict';

var devServerPort = 8081;
var specE2eFiles = 'spec-e2e/**/*.js';

/* global exports */
exports.config = {
  specs: [specE2eFiles],
  multiCapabilities: [
    {'browserName': 'firefox'},
    {'browserName': 'chrome'}
  ],
  baseUrl: 'http://localhost:' + devServerPort
};
