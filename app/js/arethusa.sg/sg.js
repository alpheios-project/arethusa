"use strict";

angular.module('arethusa.sg').service('sg', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('sg', self);
    }

    configure();

    this.init = function() {
      configure();
    };
  }
]);
