"use strict";

angular.module('arethusa').service('text', function(state, configurator) {
  var self = this;
  configurator.getConfAndDelegate('text', self);
});
