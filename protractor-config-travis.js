'use strict';

var devServerPort = 8084;
var specE2eFiles = 'spec-e2e/**/*.js';
/* global exports */
exports.config = {
  sauceUser: 'arethusa',
  sauceKey: '8e76fe91-f0f5-4e47-b839-0b04305a5a5c',
  'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
  'build': process.env.TRAVIS_BUILD_NUMBER,
  specs: [specE2eFiles],
  multiCapabilities: [{'browserName': 'firefox'}, {'browserName': 'chrome'}],
  //capabilities: {'browserName': 'firefox'},
  baseUrl: 'http://localhost:' + devServerPort
};
