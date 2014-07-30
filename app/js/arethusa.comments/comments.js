"use strict";

angular.module('arethusa.comments').service('comments', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('comments', self);
    }

    configure();

    this.init = function() {
      configure();
    };
  }
]);
