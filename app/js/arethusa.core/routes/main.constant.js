"use strict";

angular.module('arethusa.core').constant('MAIN_ROUTE', {
  controller: 'MainCtrl',
  template: '<div ng-include="template"></div>',
  resolve: {
    loadConfiguration: function($q, $http, $route, configurator) {
      return $http({
        method: 'GET',
        url: $route.current.params.conf || './static/configuration_default.json'
      }).then(function(result) {
        configurator.configuration = result.data;
      });
    }
  }
});
