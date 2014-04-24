annotationApp.service('morphRetriever', function($http) {
  this.getAnalyses = function(callback) {
    return $http.get('./js/controllers/analyses.json').then(callback);
  };
});
