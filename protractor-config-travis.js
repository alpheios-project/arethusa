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
    'platform': 'Linux',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  }, {
    'browserName': 'chrome',
    'version': '33',
    'platform': 'Linux',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  }, {
    'browserName': 'chrome',
    'version': '32',
    'platform': 'Linux',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  }, {
    'browserName': 'chrome',
    'version': '34',
    'platform': 'Windows 7',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  }, {
    'browserName': 'chrome',
    'version': '33',
    'platform': 'Windows 7',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  }, {
    'browserName': 'chrome',
    'version': '32',
    'platform': 'Windows 7',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  }, {
    'browserName': 'firefox',
    'version': '26',
    'platform': 'Windows 7',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  }
  /*, {
    'browserName': 'firefox',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  }*/],
  //capabilities: {'browserName': 'firefox'},
  baseUrl: 'http://localhost:' + devServerPort
};
