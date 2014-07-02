"use strict";

angular.module('arethusa.core').directive('navbarSearch', function() {
  return {
    restrict: 'A',
    replace: true,
    controller: 'SearchCtrl',
    templateUrl: 'templates/arethusa.core/navbar_search.html'
  };
});
