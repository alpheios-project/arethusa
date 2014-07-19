"use strict";

angular.module('arethusa.hist').directive('historyList', [
  'history',
  '$compile',
  function(history, $compile) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.events = history.events;
      },
      templateUrl: 'templates/arethusa.hist/history_list.html'
    };
  }
]);
