'use strict';
angular.module('arethusa.core').directive('debug', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var obj;
      // We set a watch for the given param in the parent scope,
      // so that we can stay in the game even when a reassignment
      // happens.
      scope.$watch(attrs.debug, function (newVal, oldVal) {
        obj = newVal;
      });
      scope.$watch('debug', function (newVal, oldVal) {
        if (newVal) {
          element.show();
        } else {
          element.hide();
        }
      });
      scope.prettyTokens = function () {
        return JSON.stringify(obj, null, 2);
      };
    },
    template: '<pre>{{ prettyTokens() }}</pre>'
  };
});