"use strict";

angular.module('arethusa').directive('plugin', function ($injector) {
  return {
    restrict: 'E',
    scope: true,
    link: function(scope, element, attrs) {
      var name = scope.$eval(attrs.name);
      scope.plugin = $injector.get(name);
    },
    template: '<div ng-include="plugin.template"></div>'
  };
});
