'use strict';

app.factory('FetchFileFactory', ['$http',
  function($http) {
    var _factory = {};

    _factory.fetchFile = function(file) {
      return $http.get('/browse/api/resource?resource=' + encodeURIComponent(file));
    };

    return _factory;
  }
]);
