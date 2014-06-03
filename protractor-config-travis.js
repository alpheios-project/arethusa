'use strict';

var devServerPort = 8084;
var specE2eFiles = 'spec-e2e/**/*.js';
/* global exports */
exports.config = {
  sauceUser: 'arethusa',
  sauceKey: '8e76fe91-f0f5-4e47-b839-0b04305a5a5c',
  specs: [specE2eFiles],
  multiCapabilities: [{
    'browserName': 'chrome',
    'version': '34',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  }/*, {
    'browserName': 'firefox',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  }*/],
  //capabilities: {'browserName': 'firefox'},
  baseUrl: 'http://localhost:' + devServerPort
};
