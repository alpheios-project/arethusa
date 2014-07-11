"use strict";

angular.module('arethusa.search').directive('searchByString', [
  'search',
  function(search) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.search = search;
      },
      templateUrl: 'templates/arethusa.search/search_by_string.html'
    };
  }
]);
