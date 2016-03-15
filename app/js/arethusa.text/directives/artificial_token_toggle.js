"use strict";

angular.module('arethusa.text').directive('artificialTokenToggle', [
  'text',
  function(text) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.text = text;
      },
      templateUrl: 'js/arethusa.text/templates/artificial_token_toggle.html'
    };
  }
]);
