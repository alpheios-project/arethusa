"use strict";

angular.module('arethusa.oa').factory('OaPersister', [
  'configurator',
  'oaHandler',
  function(configurator, oaHandler) {
    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      this.save = function(data, callback, errCallback) {
        resource.save(data, self.mimeType).then(callback, errCallback);
      };

      this.mimeType = 'application/json';
    };
  }
]);
