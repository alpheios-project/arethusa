"use strict";

annotationApp.service('tokenRetriever', function($http) {
  this.getData = function(callback) {
    var request = $.ajax({
      url: './static/tokens.json',
      async: false
    });

    request.done(callback);
  };
});
