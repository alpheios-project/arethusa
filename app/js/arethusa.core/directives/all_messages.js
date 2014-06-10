"use strict";

angular.module('arethusa.core').directive('allMessages', [
  'notifier',
  function(notifier) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.n = notifier;
      },
      templateUrl: 'templates/arethusa.core/all_messages.html'
    };
  }
]);
