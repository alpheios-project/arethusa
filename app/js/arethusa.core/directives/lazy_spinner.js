"use strict";

angular.module('arethusa.core').directive('lazySpinner', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'EA',
      scope: {
        promise: '=',
        delay: '@'
      },
      template: '<i class="fa fa-spinner fa-spin"></i>',
      link: function(scope, element, attrs) {
        var timeout;
        scope.$watch('promise', spin);

        function spin(promise) {
          if (promise) {
            start();
            promise['finally'](cancel);
          } else {
            cancel();
          }
        }

        function start() {
          var delay = angular.isDefined(scope.delay) ? delay : 300;
          timeout = $timeout(function() {
            element.show();
          }, delay, false);
        }

        function cancel() {
          $timeout.cancel(timeout);
          element.hide();
        }
      }
    };
  }
]);
