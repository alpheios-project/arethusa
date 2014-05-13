"use strict";

angular.module('arethusa.core').directive('debug', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var obj = scope.$eval(attrs.debug);
      scope.$watch('debug', function(newVal, oldVal) {
        if (newVal) {
          element.show();
        } else {
          element.hide();
        }
      });

      scope.prettyTokens = function() {
        return JSON.stringify(obj, null, 2);
      };
    },
    template: '<pre>{{ prettyTokens() }}</pre>'
  };
});
