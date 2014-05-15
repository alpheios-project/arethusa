"use strict";

angular.module('arethusa.core').directive('arethusaNavbar', function(configurator) {
  return {
    restrict: 'AE',
    scope: true,
    link: function(scope, element, attrs) {
      scope.template = 'templates/navbar1.html';
    },
    template: '<div ng-include="template"></div>'
  };

});
