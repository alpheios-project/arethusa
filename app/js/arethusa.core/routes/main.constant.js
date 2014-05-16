"use strict";

angular.module('arethusa.core').constant('MAIN_ROUTE', {
  controller: 'MainCtrl',
  template: '<div ng-include="template"></div>',
  resolve: {
    loadConfiguration: function($q, $http, $route, configurator) {
      var params = $route.current.params;
      var confPath = './static/configs/';
      var confUrl;

      // Fall back to default and wrong paths to conf files
      // need to be handled separately eventually
      if (params.conf) {
        confUrl = confPath + params.conf + '.json';
      } else if (params.conf_file) {
        confUrl = params.conf_file;
      } else {
        confUrl = confPath + 'default.json';
      }

      return $http({
        method: 'GET',
        url: confUrl,
      }).then(function(result) {
        configurator.defineConfiguration(result.data);
      });
    }
  }
});
