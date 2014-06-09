'use strict';
angular.module('arethusa.core').controller('NotifierCtrl', [
  '$scope',
  'notifier',
  function ($scope, notifier) {
    $scope.messages = notifier.messages;
    $scope.$watchCollection('messages', function (newVal, oldVal) {
      $scope.lastMessage = notifier.lastMessage();
      $scope.oldMessages = notifier.oldMessages();
    });
  }
]);
