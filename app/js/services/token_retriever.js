"use strict";

angular.module('arethusa').service('tokenRetriever', function($http) {
  // tokens should always be loaded synchronous - the app should
  // not start anything without knowing an initial state
  this.getData = function(callback) {
    var request = $.ajax({
      url: './static/tokens.json',
      async: false
    });

    request.done(callback);
  };
});
