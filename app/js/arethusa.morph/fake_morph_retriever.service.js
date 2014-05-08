"use strict";

angular.module('arethusa.morph').service('fakeMorphRetriever', function($http) {
  this.getStubData = function(callback) {
    var result;
    var request = $.ajax({
      url: './static/analyses.json',
      async: false
    });

    request.done(callback);
  };

  var stubData;
  this.getStubData(function(res) {
    stubData = res;
  });

  this.getData = function(string, callback) {
    var result = stubData[string] || [];
    callback(result);
  };
});
