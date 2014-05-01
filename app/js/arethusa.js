"use strict";

/* global annotationApp:true */
var annotationApp = angular.module(
  'arethusa',
  ['mm.foundation', 'ngRoute', 'arethusa-core', 'arethusa-conf'],
  function($routeProvider) {
    $routeProvider.when('/', {
      controller: 'MainController',
      templateUrl: 'templates/main2.html',
      resolve: {
        loadConfiguration: function($q, $http, configurator) {
          return $http({
            method: 'GET', 
            url: './static/configuration1.json'
          }).then(function(result) {
            configurator.configuration = result.data;
          });
        }
      }
    }
  );
});
