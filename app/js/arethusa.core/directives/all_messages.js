"use strict";

angular.module('arethusa.core').directive('allMessages', [
  'notifier',
  '$timeout',
  function(notifier, $timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.notifier = notifier;

        scope.$watch('notifier.panelActive', function(newVal, oldVal) {
          scope.active = newVal;
          // Timeout to give the animation some breathing room.
          // In the first digest we activate the panel through ngIf,
          // in the following we make the element visible.
          $timeout(function() {
            if (newVal) element.slideDown(); else element.slideUp();
          });
        });
      },
      templateUrl: 'templates/arethusa.core/all_messages.html'
    };
  }
]);
