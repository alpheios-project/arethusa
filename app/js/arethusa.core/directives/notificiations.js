"use strict";

angular.module('arethusa.core').directive('notifications', [
  'notifier',
  function(notifier) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
      },
      templateUrl: 'templates/arethusa.core/notifications.html'
    };
  }
]);
