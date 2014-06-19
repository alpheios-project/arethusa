'use strict';
angular.module('arethusa', [
  'mm.foundation',
  'ngRoute',
  'arethusa.core',
  'arethusa.contextMenu',
  'arethusa.confEditor',
  'arethusa.morph',
  'arethusa.depTree',
  'arethusa.hist',
  'arethusa.review',
  'arethusa.search',
  'arethusa.exercise',
  'arethusa.relation',
  'arethusa.sg'
], ['$routeProvider', 'MAIN_ROUTE', 'CONF_ROUTE',
function ($routeProvider, MAIN_ROUTE, CONF_ROUTE) {
  $routeProvider.when('/', MAIN_ROUTE);
  $routeProvider.when('/conf_editor', CONF_ROUTE);
  $routeProvider.when('/:conf', MAIN_ROUTE);
  $routeProvider.when('/conf_editor/:conf', CONF_ROUTE);
}]);
