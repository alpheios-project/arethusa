"use strict";

angular.module('arethusa.constituents').service('constituents', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    this.name = 'constituents';

    this.defaultConf = {
      template: 'js/arethusa.constituents/templates/constituents.html'
    };

    function configure() {
      configurator.getConfAndDelegate(self);
    }

    this.init = function() {
      configure();
    };
  }
]);
