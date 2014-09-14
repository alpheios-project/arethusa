"use strict";

angular.module('arethusa.tei').service('tei', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    this.name = 'tei';

    this.defaultConf = {
      template: 'templates/arethusa.tei/tei.html'
    };

    function configure() {
      configurator.getConfAndDelegate(self);
    }

    this.init = function() {
      configure();
    };
  }
]);
