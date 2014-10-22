"use strict";

angular.module('arethusa.core').directive('outputter', [
  '$modal',
  function($modal) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        element.bind('click', function() {
          $modal.open({
            controller: 'OutputterCtrl',
            templateUrl: 'templates/arethusa.core/outputter.html'
          });
        });
      },
      template: '<i class="fa fa-download"/>'
    };
  }
]);

angular.module('arethusa.core').controller('OutputterCtrl', [
  '$scope',
  'saver',
  function($scope, saver) {
    $scope.saver = saver;
  }
]);
