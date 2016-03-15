"use strict";

angular.module('arethusa.core').directive('notifications', [
  'notifier',
  function(notifier) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
      },
      templateUrl: 'js/arethusa.core/templates/notifications.html'
    };
  }
]);
