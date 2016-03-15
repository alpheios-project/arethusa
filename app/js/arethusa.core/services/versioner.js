"use strict";

angular.module('arethusa.core').service('versioner', [
  'VERSION',
  function(VERSION) {
    var self = this;

    function gitTree(path) {
      return self.repository + '/tree/' + path;
    }

    angular.extend(this, VERSION);
    this.commitUrl = gitTree(VERSION.revision);
    this.branchUrl = gitTree(VERSION.branch);
  }
]);
