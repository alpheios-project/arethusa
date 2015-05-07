"use strict";

angular.module('arethusa.opendata-network').service('opendata-network', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    this.name = 'opendata-network';

    this.defaultConf = {
      template: 'templates/arethusa.opendata-network/opendata-network.html'
    };

    function configure() {
      configurator.getConfAndDelegate(self);
    }

    this.init = function() {
      configure();
    };
  }
]);
