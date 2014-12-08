"use strict";

angular.module('arethusa.artificialToken').directive('artificialTokenEdit', [
  'artificialToken',
  'state',
  '$timeout',
  function(artificialToken, state, $timeout) {
    return {
      restrict: 'A',
      scope: {
        token: '=artificialTokenEdit'
      },
      link: function(scope, element, attrs) {
        scope.aT = artificialToken;
        scope.string = scope.token.string;
        scope.type   = scope.token.type;

        scope.changeType = function() {
          state.change(scope.token.id, 'type', scope.type);
        };

        // We don't want to change the string with every keystroke, we
        // therefore do it timeouted.
        var timer;
        scope.changeString = function() {
          if (timer) $timeout.cancel(timer);
          timer = $timeout(function() {
            state.change(scope.token.id, 'string', scope.string);
          }, 500);
        };

      },
      templateUrl: 'templates/arethusa.artificial_token/artificial_token_edit.html'
    };
  }
]);
