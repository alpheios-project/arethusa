annotationApp.controller('MorphController', function($scope) {
  $scope.analyses = [
    { 'id' : '1', 'pos' : 'noun' },
    { 'id' : '2', 'pos' : 'noun' },
    { 'id' : '3', 'pos' : 'pred' },
    { 'id' : '4', 'pos' : 'punct' }
  ];

  $scope.currentAnalysis = function() {
    return $scope.analyses[$scope.selectedToken.id - 1]
  }
});
