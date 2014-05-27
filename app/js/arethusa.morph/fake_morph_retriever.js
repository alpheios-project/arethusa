'use strict';
// Deprecated and not working, we don't need this anymore as we can just use the real deal.
// Kept for sudden mind changes.
angular.module('arethusa.morph').service('fakeMorphRetriever', function () {
  this.getStubData = function (callback) {
    var result;
    var request = $.ajax({
        url: './static/analyses.json',
        async: false
      });
    request.done(callback);
  };
  var stubData;
  this.getStubData(function (res) {
    stubData = res;
  });
  this.getData = function (string, callback) {
    var result = stubData[string] || [];
    callback(result);
  };
});
