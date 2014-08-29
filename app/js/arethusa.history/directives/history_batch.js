"use strict";

angular.module('arethusa.history').directive('historyBatch', function() {
  return {
    restrict: 'A',
    scope: {
      batch: '=historyBatch'
    },
    link: function(scope, element, attrs) {
      scope.events = scope.batch.events;
    },
    templateUrl: 'templates/arethusa.history/history_batch.html'
  };
});
