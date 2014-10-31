"use strict";

angular.module('arethusa.core').service('versioner', [
  'VERSION',
  function(VERSION) {
    angular.extend(this, VERSION);
    this.commitUrl = this.repository + '/tree/' + VERSION.revision;
  }
]);
