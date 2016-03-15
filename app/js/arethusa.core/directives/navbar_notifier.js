"use strict";

angular.module('arethusa.core').directive('navbarNotifier', function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'js/arethusa.core/templates/navbar_notifier.html'
  };
});

