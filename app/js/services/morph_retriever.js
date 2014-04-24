annotationApp.service('morphRetriever', function($q, $http) {
  this.getAnalyses = function(callback) {
    return $http.get('./js/controllers/analyses.json').then(callback);
  };
});
