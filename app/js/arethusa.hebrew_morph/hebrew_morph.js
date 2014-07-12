"use strict";

angular.module('arethusa.hebrewMorph').service('hebrewMorph', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('hebrewMorph', self);
    }

    configure();

    this.init = function() {
      configure();
    };
  }
]);
