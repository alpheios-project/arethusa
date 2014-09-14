"use strict";

// TODO
//
// This is completely the same as the w directive right now.
// Refactor and extract common pieces.
angular.module('arethusa.tei').directive('pc', [
  'idHandler',
  'state',
  function(idHandler, state) {
    return {
      restrict: 'E',
      scope: {},
      link: function(scope, element, attrs) {
        var sId = attrs.sN;
        var id  = attrs.n;

        var intId = idHandler.getId(id, sId);
        scope.token = state.getToken(intId);
      },
      templateUrl: 'templates/arethusa.tei/w.html'
    };
  }
]);

