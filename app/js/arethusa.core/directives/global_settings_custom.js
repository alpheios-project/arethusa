"use strict";

angular.module('arethusa.core').directive('globalSettingsCustom', [
  '$compile',
  function($compile) {
    return {
      restrict: 'A',
      scope: {
        directive: "@globalSettingsCustom"
      },
      link: function(scope, element, attrs) {
        var template = '<div ' + scope.directive + '></div>';
        element.append($compile(template)(scope));
      },
    };
  }
]);
