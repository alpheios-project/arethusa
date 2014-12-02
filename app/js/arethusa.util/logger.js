'use strict';
/* global console */

angular.module('arethusa.util').service('logger', [
  'configurator',
  function(configurator) {
    var conf = configurator.configurationFor('logger');
    var resource = configurator.provideResource(conf.resource);

    this.log = function(msg) {
      console.log(msg);
    };

    this.remoteLog = function(msg) {
      if (resource) {
        resource.post(msg, 'text/plain');
      }
    };
  }
]);
