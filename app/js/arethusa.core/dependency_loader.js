"use strict";

angular.module('arethusa.core').service('dependencyLoader', [
  '$ocLazyLoad',
  '$q',
  function($ocLazyLoad, $q) {
    this.load = function(args) {
      return $ocLazyLoad.load(args);
    };

    this.loadInOrder = function(args) {
      var start = $q.defer();
      var promises = [start.promise];
      angular.forEach(args, function(el, i) {
        var deferred = $q.defer();
        promises.push(deferred.promise);
        promises[i].then(function() {
          $ocLazyLoad.load(el)['finally'](aU.resolveFn(deferred));
        });
      });
      start.resolve();
      return aU.last(promises);
    };
  }
]);
