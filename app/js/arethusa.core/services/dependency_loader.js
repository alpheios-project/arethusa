"use strict";

angular.module('arethusa.core').service('dependencyLoader', [
  '$ocLazyLoad',
  '$q',
  'BASE_PATH',
  function($ocLazyLoad, $q, BASE_PATH) {
    function expand(p) {
      if (aU.isUrl(p)) {
        return p;
      } else {
        return BASE_PATH + '/' + p;
      }
    }
    function expandPath(path) {
      var res = [];
      if (angular.isArray(path)) {
        return aU.map(path, expand);
      } else {
        if (angular.isString(path)) {
          return expand(path);
        } else {
          var files = aU.map(path.files, expand);
          path.files = files;
          return path;
        }
      }
    }
    this.load = function(args) {
      return $ocLazyLoad.load(expandPath(args));
    };

    this.loadInOrder = function(args) {
      var start = $q.defer();
      var promises = [start.promise];
      angular.forEach(args, function(el, i) {
        var deferred = $q.defer();
        promises.push(deferred.promise);
        promises[i].then(function() {
          $ocLazyLoad.load(expandPath(el))['finally'](aU.resolveFn(deferred));
        });
      });
      start.resolve();
      return aU.last(promises);
    };
  }
]);
