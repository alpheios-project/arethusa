var annotationApp = angular.module('annotationApp');

annotationApp.controller('TextController', function($scope) {
  $scope.tokens = [
    { 'string' : 'Marcus', 'id' : '1' },
    { 'string' : 'rosam', 'id' : '2' },
    { 'string' : 'videt', 'id' : '3' },
    { 'string' : '.', 'id' : '4' }
  ];

  $scope.selectedToken = ''
});
