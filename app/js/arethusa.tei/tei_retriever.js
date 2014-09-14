"use strict";

angular.module('arethusa.tei').factory('TeiRetriever', [
  'configurator',
  function(configurator) {
    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      this.get = function(callback) {
        resource.get().then(function(res) {
          var data = res.data;
          callback(data);
        });
      };
    };
  }
]);
