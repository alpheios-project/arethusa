"use strict";

// Deprecated and not working - we won't need this anymore I guess.
// Keeping it for now in case I change my mind.

angular.module('arethusa').factory('tokenRetriever', function($http) {
  return {
    getData:  function(callback) {
      $http.get('./static/tokens.json').then(function(res) {
        callback(res.data);
      });
    }
  };
});
