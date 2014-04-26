"use strict";

annotationApp.service('morphRetriever', function($http) {
  this.getData = function(callback) {
    var result;
    request = $.ajax({
      url: './static/analyses.json',
      async: false
    });

    request.done(callback);
  };
});
