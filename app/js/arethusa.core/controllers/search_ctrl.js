'use strict';
angular.module('arethusa.core').controller('SearchCtrl', [
  '$scope',
  '$location',
  'translator',
  function ($scope, $location, translator) {
    $scope.search = function () {
      $location.search('doc', $scope.query);
    };

    translator('search_documents', function(translation) {
      $scope.search_documents = translation();
    });
  }
]);
