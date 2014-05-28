'use strict';
// deprecated for now
angular.module('arethusa.core').service('locator', [
  '$location',
  function ($location) {
    // TODO
    // - Retrieve the uris from the route on startup
    // - Populate the locators obj from the config file
    var locators = { treebankRetriever: 'doc' };
    this.getUri = function (name) {
      return $location.search()[locators[name]];
    };
    this.setUri = function (name, uri) {
      $location.search(name, uri);
    };
  }
]);
