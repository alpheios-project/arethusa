"use strict";

angular.module('arethusa.core').service('versioner', [
  'VERSION',
  function(VERSION) {
    this.revision = VERSION.revision;
    this.date = VERSION.date;
  }
]);
