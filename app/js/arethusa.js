"use strict";

angular.module(
  'arethusa', [
    'mm.foundation',
    'ngRoute',
    'arethusa.core',
    'arethusa.morph',
    'arethusa.hist'
  ],
  function($routeProvider, MAIN_ROUTE) {
    $routeProvider.when('/', MAIN_ROUTE);
    $routeProvider.when('/:conf', MAIN_ROUTE);
  }
);
