"use strict";

/**
 * The service is a wrapper for $ocLazyLoad that can be applied to arrays and makes sure paths are URLs
 */
angular.module('arethusa.core').service('dependencyLoader', [
  '$ocLazyLoad',
  '$q',
  'BASE_PATH',
  function($ocLazyLoad, $q, BASE_PATH) {

    var self = this;

    /**
     * Use $ocLazyLoad after assuring paths are URLs
     * @param args
     * @returns {*}
       */
    this.load = function(args) {
      return $ocLazyLoad.load(expandPath(args));

      /**
       * Apply URL conversion to different kinds of path containers
       * @param path
       * @returns {*}
       */
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

        /**
         * Convert relative path to URL if necessary
         * @param p
         * @returns {*}
         */
        function expand(p) {
          if (aU.isUrl(p)) {
            return p;
          } else {
            return BASE_PATH + '/' + p;
          }
        }
      }
    };

    /**
     * Chains $ocLazyLoad promises for paths together and returns last promise
     * @param args
     * @returns {*}
       */
    this.loadInOrder = function(args) {
      var start = $q.defer();
      var promises = [start.promise];
      angular.forEach(args, function(el, i) {
        var deferred = $q.defer();
        promises.push(deferred.promise);
        promises[i].then(function() {
          self.load(el)['finally'](aU.resolveFn(deferred));
        });
      });
      start.resolve();
      return aU.last(promises);
    };
  }
]);
