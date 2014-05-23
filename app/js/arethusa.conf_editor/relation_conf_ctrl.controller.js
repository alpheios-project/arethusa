"use strict";

angular.module('arethusa.confEditor').controller('relationConfCtrl', function($scope) {
  $scope.labels = $scope.conf.relations.labels;
});
