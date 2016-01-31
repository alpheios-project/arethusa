'use strict';
angular.module('arethusa.core').service('documentStore', function () {
  var self = this;

  this.reset = function () {
    this.store = {};
    this.confs = {};
  };

  function extractConf(doc) {
    angular.extend(self.confs, doc.conf);
  }

  this.addDocument = function (location, doc) {
    self.store[location] = doc;
    extractConf(doc);
  };

  this.hasAdditionalConfs = function() {
    return !angular.equals(self.confs, {});
  };

  this.reset();
});
