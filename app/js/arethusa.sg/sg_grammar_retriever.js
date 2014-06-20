"use strict";

angular.module('arethusa.sg').factory('SgGrammarRetriever', [
  'configurator',
  function(configurator) {
    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
    };
  }
]);
