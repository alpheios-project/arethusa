"use strict";

angular.module('arethusa.core').directive('navbarButtons', function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'templates/arethusa.core/navbar_buttons.html'
  };
});
