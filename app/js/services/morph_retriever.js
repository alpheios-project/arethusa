annotationApp.service('morphRetriever', function($http) {
  this.getAnalyses = function(callback) {
    return $http.get('./static/analyses.json').then(callback);
  };
});
