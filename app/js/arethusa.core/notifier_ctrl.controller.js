"use strict";

angular.module('arethusa.core').controller('NotifierCtrl', function($scope, notifier) {
  $scope.$watch('notifier.messages', function(newVal, oldVal) {
    $scope.lastMessage = notifier.lastMessage();
    $scope.oldMessages = notifier.oldMessages();
  });
});
