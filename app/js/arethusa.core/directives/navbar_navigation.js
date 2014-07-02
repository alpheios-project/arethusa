"use strict";

angular.module('arethusa.core').directive('navbarNavigation', function() {
  return {
    restrict: 'A',
    replace: true,
    controller: 'NavigatorCtrl',
    templateUrl: 'templates/arethusa.core/navbar_navigation.html'
  };
});
