'use strict';
// Handles params concerning configuration files in the $routeProvider phase
angular.module('arethusa.core').factory('confUrl', [
  '$route',
  function ($route) {
    return function (useDefault) {
      var params = $route.current.params;
      var confPath = './static/configs/';
      // Fall back to default and wrong paths to conf files
      // need to be handled separately eventually
      if (params.conf) {
        return confPath + params.conf + '.json';
      } else if (params.conf_file) {
        return params.conf_file;
      } else {
        if (useDefault) {
          return confPath + 'default.json';
        }
      }
    };
  }
]);