"use strict";

angular.module('arethusa.core').constant('MAIN_ROUTE', {
  controller: 'MainCtrl',
  template: '<div ng-include="template"></div>',
  resolve: {
    loadConfiguration: function($http, confUrl, configurator) {
      return $http.get(confUrl()).then(function(res) {
        configurator.defineConfiguration(res.data);
      });
    }
  }
});
