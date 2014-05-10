"use strict";

angular.module(
  'arethusa', [
    'mm.foundation',
    'ngRoute',
    'arethusa.core',
    'arethusa.morph',
    'arethusa.hist'
  ],
  function($routeProvider) {
    $routeProvider.when('/', {
      controller: 'MainCtrl',
      templateUrl: 'templates/main2.html',
      resolve: {
        loadConfiguration: function($q, $http, $route, configurator) {
          console.log($route.current.params.conf);
          return $http({
            method: 'GET',
            url: $route.current.params.conf
          }).then(function(result) {
            configurator.configuration = result.data;
          });
        }
      }
    }
  );
});
