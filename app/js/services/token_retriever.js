"use strict";

angular.module('arethusa').service('tokenRetriever', function($http) {
  this.getData = function(callback) {
    $http.get('./static/tokens.json').then(function(res) {
      callback(res.data);
    });
  };
});
