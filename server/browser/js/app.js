'use strict';

angular.module('fileBrowserApp', [
  'ngRoute',
  'jsTree.directive'
])
.config([
  '$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: '/server/browser/templates/home.html',
      controller: 'BrowserController'
    }).
    otherwise({
      redirectTo: '/'
    });
  }
]);

