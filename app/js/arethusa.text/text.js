'use strict';
angular.module('arethusa.text').service('text', [
  'state',
  'configurator',
  function (state, configurator) {
    var self = this;
    configurator.getConfAndDelegate('text', self);
  }
]);
