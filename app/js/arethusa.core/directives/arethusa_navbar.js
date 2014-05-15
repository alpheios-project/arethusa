"use strict";

angular.module('arethusa.core').directive('arethusaNavbar', function(configurator) {
  return {
    restrict: 'AE',
    scope: true,
    link: function(scope, element, attrs) {
      var conf = configurator.configurationFor('navbar');
      scope.template = conf.template;
      scope.hide   = conf.hide;

      scope.showSearch = function() {
        return conf.search;
      };

      scope.showNavigation = function() {
        return conf.navigation;
      };
    },
    template: '<div ng-hide="hide" ng-include="template"></div>'
  };

});
