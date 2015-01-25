"use strict";

angular.module('arethusa.core').service('routeChangeWatcher', [
  '$rootScope',
  '$window',
  function($rootScope, $window) {
    $rootScope.$on('$locationChangeSuccess', function() {
      $window.location.reload();
    });
  }
]);
