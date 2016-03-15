"use strict";

angular.module('arethusa.core').directive('navbarNavigation', function() {
  return {
    restrict: 'A',
    replace: true,
    controller: 'NavigatorCtrl',
    templateUrl: 'js/arethusa.core/templates/navbar_navigation.html'
  };
});
