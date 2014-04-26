"use strict";

annotationApp.service('morphRetriever', function($http) {
  this.getData = function(callback) {
    var request = $.ajax({
      url: './static/analyses.json',
      async: false
    });

    request.done(callback);
  };
});
