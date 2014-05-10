"use strict";

angular.module('arethusa.core').constant('MAIN_ROUTE', {
  controller: 'MainCtrl',
  template: '<div ng-include="template"></div>',
  resolve: {
    loadConfiguration: function($q, $http, $route, configurator) {
      var files = {
        default: './static/configs/default.json',
        staging: './static/configs/staging.json'
      };
      var params = $route.current.params;
      var confUrl;

      // Fall back to default and wrong paths to conf files
      // need to be handled separately eventually
      if (params.conf) {
        confUrl = files[params.conf] || files.default;
      } else if (params.conf_file) {
        confUrl = params.conf_file;
      } else {
        confUrl = files.default;
      }

      return $http({
        method: 'GET',
        url: confUrl,
      }).then(function(result) {
        configurator.configuration = result.data;
      });
    }
  }
});
