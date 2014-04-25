annotationApp.service('tokenRetriever', function($http) {
  this.getData = function(callback) {
    return $http.get('./static/tokens.json').then(callback);
  };
});
