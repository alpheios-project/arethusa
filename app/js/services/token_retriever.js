"use strict";

angular.module('arethusa').factory('tokenRetriever', function($http) {
  return {
    getData:  function(callback) {
      $http.get('./static/tokens.json').then(function(res) {
        callback(res.data);
      });
    }
  };
});
