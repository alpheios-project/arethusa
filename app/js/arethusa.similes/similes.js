"use strict";

angular.module('arethusa.similes').service('similes', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    this.name = 'similes';

    this.defaultConf = {
      template: 'templates/arethusa.similes/similes.html'
    };

    function configure() {
      configurator.getConfAndDelegate(self);
    }

    this.init = function() {
      configure();
    };
  }
]);
