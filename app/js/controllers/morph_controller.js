annotationApp.controller('MorphController', function($scope, configurator) {
  var conf = configurator.conf_for('MorphController');
  morphRetriever = configurator.getService(conf.retriever);

  morphRetriever.getData(function(res) {
    $scope.analyses = res.data;
  });

  $scope.currentAnalysis = function() {
    return $scope.analyses[$scope.selectedToken.id - 1];
  };

  $scope.template = 'templates/morph.html';
});
