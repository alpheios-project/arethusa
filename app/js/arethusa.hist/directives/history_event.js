"use strict";

angular.module('arethusa.hist').directive('historyEvent', [
  'idHandler',
  '$compile',
  function(idHandler, $compile) {
    return {
      restrict: 'A',
      scope: {
        event: '=historyEvent'
      },
      link: function(scope, element, attrs) {
        var tokenTemplate = '\
          <span\
            class="text"\
            token="token"\
            colorize="true"\
            click="true"\
            hover="true">\
          </span>\
        ';

        function valToString(val) {
          if (val && typeof val === 'object') scope.blocked = true;
          return val || 'nothing';
        }

        scope.blocked = false;

        scope.token = scope.event.token;
        scope.id    = scope.token.id;
        scope.property = scope.event.property;
        scope.oldVal = valToString(scope.event.oldVal);
        scope.newVal = valToString(scope.event.newVal);

        scope.formatId = function(id) {
          return idHandler.formatId(id, '%w');
        };

        element.find('#token').append($compile(tokenTemplate)(scope));
      },
      templateUrl: 'templates/arethusa.hist/history_event.html'
    };
  }
]);
