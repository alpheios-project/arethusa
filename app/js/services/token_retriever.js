annotationApp.service('tokenRetriever', function($http) {
  this.getAnalyses = function(callback) {
    return $http.get('./static/tokens.json').then(callback);
  };
});
