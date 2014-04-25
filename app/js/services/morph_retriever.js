annotationApp.service('morphRetriever', function($http) {
  this.getData = function(callback) {
    return $http.get('./static/analyses.json').then(callback);
  };
});
