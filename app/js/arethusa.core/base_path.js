"use strict";

angular.module('arethusa.core').service('basePath', [
  function() {
    var self = this;
    var defaultPath = '..';

    this.path = defaultPath;

    this.set = function(path) {
      self.path = path || defaultPath;
    };
  }
]);
