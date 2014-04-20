var annotationApp = angular.module('annotationApp', []);

annotationApp.controller('TextController', function($scope) {
  $scope.tokens = [
    { 'string' : 'Marcus' },
    { 'string' : 'rosam' },
    { 'string' : 'videt' },
    { 'string' : '.' }
  ];
});
