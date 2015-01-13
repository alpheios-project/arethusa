'use strict';

angular.module('fileBrowserApp').factory('FetchFileFactory', ['$http',
  function($http) {
    var _factory = {};

    var apiPath = '/browse/api';

    function getResource(path, file) {
      return $http.get(apiPath + '/' + path + '?resource=' + encodeURIComponent(file));
    }

    _factory.fetchFile = function(file) {
      return getResource('resource', file);
    };

    _factory.fetchStats = function(file) {
      return getResource('stats', file);
    };

    _factory.moveFile = function(oldName, newName) {
      return $http.post(apiPath + '/' + 'move', {
        old: oldName,
        new: newName
      });
    };

    return _factory;
  }
]);
