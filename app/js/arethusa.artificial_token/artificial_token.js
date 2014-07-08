"use strict";

angular.module('arethusa.artificialToken').service('artificialToken', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('artificialToken', self);
    }

    configure();

    this.init = function() {
      configure();
    };
  }
]);
