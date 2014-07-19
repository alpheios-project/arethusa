"use strict";

angular.module('arethusa.hist').directive('historyEvent', [
  'idHandler',
  function(idHandler) {
    return {
      restrict: 'A',
      scope: {
        event: '=historyElement'
      },
      link: function(scope, element, attrs) {
        scope.token = scope.event.token;
        scope.id    = scope.token.id;
        scope.formatId = function(id) {
          return idHandler.formatId(id, '%w');
        };
      },
      templateUrl: 'templates/arethusa.hist/history_event.html'
    };
  }
]);
