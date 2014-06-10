"use strict";

angular.module('arethusa.core').directive('currentMessage', [
  'notifier',
  '$timeout',
  function(notifier, $timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var timer;

        function setMessage(message) {
          scope.message = message;
        }
        function clearMessage() {
          scope.hide = true;
        }

        function cancelTimer() {
          scope.hide = false;
          $timeout.cancel(timer);
        }
        function setTimer() {
          timer = $timeout(clearMessage, notifier.duration);
        }

        scope.notifier = notifier;
        scope.messages = notifier.messages;
        scope.$watch('notifier.current', function(newVal, oldVal) {
          cancelTimer();
          setMessage(newVal);
          setTimer();
        });
      },
      template: '\
        <span\
          ng-hide="hide"\
          class="{{ message.type }}-message">\
            {{ message.message }}\
        </span>\
      '
    };
  }
]);
