"use strict";

angular.module('arethusa').directive('plugin', function() {
  return {
    restrict: 'E',
    scope: true,
    link: function(scope, element, attrs) {
      scope.plugin = scope.$eval(attrs.name);
    },
    template: '<div id="{{ plugin.name }}" ng-include="plugin.template"></div>'
  };
});
