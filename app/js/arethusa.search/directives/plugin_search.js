"use strict";

angular.module('arethusa.search').directive('pluginSearch', function() {
  return {
    restrict: 'AE',
    scope: true,
    replace: true,
    link: function(scope, element, attrs) {
      scope.plugin = scope.$eval(attrs.pluginSearch);
      scope.template = 'js/arethusa.' + scope.plugin.name + '/templates/search.html';
    },
    template: '<div ng-include="template"></div>'
  };
});
