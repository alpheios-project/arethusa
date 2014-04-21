annotationApp.controller('MainController', function($scope) {
  $scope.tokens = [
    { 'string' : 'Marcus', 'id' : '1' },
    { 'string' : 'rosam', 'id' : '2' },
    { 'string' : 'videt', 'id' : '3' },
    { 'string' : '.', 'id' : '4' }
  ];

  $scope.selectedToken = { id: '1' };

  $scope.currentToken = function() {
    return $scope.tokens[$scope.selectedToken.id - 1]
  };
});
