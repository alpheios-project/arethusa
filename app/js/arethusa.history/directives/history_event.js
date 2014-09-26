"use strict";

angular.module('arethusa.history').directive('historyEvent', [
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

        scope.token = scope.event.token;
        scope.id    = scope.token.id;
        scope.type  = scope.event.type;
        scope.trslKey = {
          start: 'history.' + scope.type + '.start',
          end:   'history.' + scope.type + '.end'
        };

        if (scope.type === 'change') {
          scope.blocked = false;
          scope.property = scope.event.property;
          scope.oldVal = valToString(scope.event.oldVal);
          scope.newVal = valToString(scope.event.newVal);
        }

        scope.formatId = function(id) {
          return idHandler.formatId(id, '%w');
        };

        element.find('#token').append($compile(tokenTemplate)(scope));
      },
      templateUrl: 'templates/arethusa.history/history_event.html'
    };
  }
]);
