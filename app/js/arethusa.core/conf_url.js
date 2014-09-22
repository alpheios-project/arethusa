'use strict';
// Handles params concerning configuration files in the $routeProvider phase
angular.module('arethusa.core').factory('confUrl', [
  'CONF_PATH',
  '$route',
  function (CONF_PATH, $route) {
    // The default route is deprectated and can be refactored away
    return function (useDefault) {
      var params = $route.current.params;
      var confPath = CONF_PATH + '/';
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
