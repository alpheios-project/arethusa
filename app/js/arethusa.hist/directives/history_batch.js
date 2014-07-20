"use strict";

angular.module('arethusa.hist').directive('historyBatch', function() {
  return {
    restrict: 'A',
    scope: {
      batch: '=historyBatch'
    },
    link: function(scope, element, attrs) {
      scope.events = scope.batch.events;
    },
    templateUrl: 'templates/arethusa.hist/history_batch.html'
  };
});
