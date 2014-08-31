"use strict";

angular.module('arethusa.core').service('dependencyLoader', [
  '$ocLazyLoad',
  '$q',
  function($ocLazyLoad, $q) {
    this.load = function(args) {
      return $ocLazyLoad.load(args);
    };

    this.loadSync = function(args) {
      var start = $q.defer();
      var promises = [start.promise];
      angular.forEach(args, function(el, i) {
        var defer = $q.defer();
        promises.push(defer.promise);
        promises[i].then(function() {
          $ocLazyLoad.load(el)['finally'](function() {
            defer.resolve();
          });
        });
      });
      start.resolve();
      return aU.last(promises);
    };
  }
]);
