"use strict";

angular.module('arethusa.hist').directive('historyList', [
  'history',
  '$compile',
  function(history, $compile) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.history = history;
        scope.events = history.events;

        scope.$watch('history.position', function(newVal, oldVal) {
          scope.position = newVal;
        });
      },
      templateUrl: 'templates/arethusa.hist/history_list.html'
    };
  }
]);
