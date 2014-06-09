"use strict";

angular.module('arethusa.core').directive('currentMessage', [
  'notifier',
  function(notifier) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.notifier = notifier;
        scope.messages = notifier.messages;
        scope.$watch('notifier.current', function(newVal, oldVal) {
          scope.message = newVal;
        });
      },
      template: '<span class="{{ message.type }}-message">{{ message.message }}</span>'
    };
  }
]);
