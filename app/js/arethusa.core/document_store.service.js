"use strict";

angular.module('arethusa.core').service('documentStore', function() {
  var self = this;

  this.store = {};

  this.reset = function() {
    this.store = {};
  };

  this.addDocument = function(location, doc) {
    self.store[location] = { doc: doc };
  };
});
