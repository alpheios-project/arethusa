"use strict";

angular.module('arethusa.core').directive('navbarSearch', function() {
  return {
    restrict: 'A',
    replace: true,
    controller: 'SearchCtrl',
    templateUrl: 'js/arethusa.core/templates/navbar_search.html'
  };
});
