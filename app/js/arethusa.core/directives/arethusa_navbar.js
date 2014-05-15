"use strict";

angular.module('arethusa.core').directive('arethusaNavbar', function(configurator) {
  return {
    restrict: 'AE',
    scope: true,
    link: function(scope, element, attrs) {
      var conf = configurator.configurationFor('navbar');
      scope.template = 'templates/navbar1.html';
      scope.search = conf.search;
      scope.hide   = conf.hide;
      scope.navigation = conf.navigation;
    },
    template: '<div ng-hide="hide" ng-include="template"></div>'
  };

});
