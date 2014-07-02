"use strict";

angular.module('arethusa.core').directive('navbarNotifier', function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'templates/arethusa.core/navbar_notifier.html'
  };
});

