"use strict";

angular.module('arethusa').directive('plugin', function ($injector) {
  return {
    restrict: 'E',
    scope: true,
    link: function(scope, element, attrs) {
      // obj is either a string  and refers to an angular service or
      // an object - an external service itself
      var obj = scope.$eval(attrs.name);
      if (angular.isString(obj)) {
        scope.plugin = $injector.get(obj);
        scope.pluginName = obj;
      } else {
        scope.plugin = obj;
        scope.pluginName = obj.name;
      }
    },
    template: '<div id="pluginName" ng-include="plugin.template"></div>'
  };
});
