"use strict";

angular.module('arethusa.core').directive('stateDebug', function(state) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.$watch('debug', function(newVal, oldVal) {
        if (newVal) {
          element.show();
        } else {
          element.hide();
        }
      });

      scope.prettyTokens = function() {
        return JSON.stringify(state.tokens, null, 2);
      };
    },
    template: '<pre>{{ prettyTokens() }}</pre>'
  };
});
