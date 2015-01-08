"use strict";

angular.module('arethusa.tei').directive('w', [
  'idHandler',
  'state',
  function(idHandler, state) {
    return {
      restrict: 'E',
      scope: {
        'meter' : '@meter'
      },
      link: function(scope, element, attrs) {
        var sId = attrs.sN;
        var id  = attrs.n;

        var intId = idHandler.getId(id, sId);
        scope.token = state.getToken(intId);
        scope.meter = element.attr('meter');
        if (scope.meter) {
            scope.token.decorate = scope.meter;
        };
      },
      templateUrl: 'templates/arethusa.tei/w.html'
    };
  }
]);
