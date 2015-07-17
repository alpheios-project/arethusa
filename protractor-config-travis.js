'use strict';

var devServerPort = 8081;
var specE2eFiles = 'spec-e2e/**/*.js';
function createCapabality(browser, version, platform) {
  return {
    'browserName': browser,
    'version': version,
    'platform': platform,
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
  };
}

/* global exports */
exports.config = {
  sauceUser: 'balmas',
  sauceKey: 'ae469ad7-eaf1-4c87-b165-c3f32d27d64a'
  specs: [specE2eFiles],
  multiCapabilities: [
    createCapabality('chrome', '37', 'Linux'),
    createCapabality('chrome', '38', 'Linux'),
    createCapabality('chrome', '37', 'Windows 7'),
    createCapabality('chrome', '38', 'Windows 7'),
    createCapabality('firefox', '25', 'Windows 7'),
    createCapabality('firefox', '33', 'OS X 10.9'),
    createCapabality('firefox', '33', 'Windows 7'),
    createCapabality('safari', '7', 'OS X 10.9')
    // createCapabality('internet explorer', '11', 'Windows 8.1')
  ],
  baseUrl: 'http://localhost:' + devServerPort
};
