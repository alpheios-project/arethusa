"use strict";

angular.module('arethusa.query').factory('AhabRetriever', [
  'configurator',
  function(configurator) {
    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      this.get = function(params, callback) {
        resource.get(params).then(function(res) {
          var data = res.data;
          callback(data);
        });
      };
    };
  }
]);
