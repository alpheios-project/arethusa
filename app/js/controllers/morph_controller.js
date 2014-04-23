annotationApp.controller('MorphController', function($scope, $http) {
  $http.get('./js/controllers/analyses.json')
       .then(function(res){
    $scope.analyses = res.data;
  });

  $scope.currentAnalysis = function() {
    return $scope.analyses[$scope.selectedToken.id - 1];
  };

  $scope.template = 'templates/morph.html';
});
