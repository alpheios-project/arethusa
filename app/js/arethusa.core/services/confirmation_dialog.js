"use strict";

angular.module('arethusa.core').service('confirmationDialog', [
  '$modal',
  '$rootScope',
  function($modal, $rootScope) {
    this.ask = function(message) {
      var scope = $rootScope.$new();
      scope.message = message;
      var promise = $modal.open({
        templateUrl: 'templates/arethusa.core/confirmation_dialog.html',
        windowClass: 'confirmation-modal',
        scope: scope
      }).result;
      promise['finally'] = function() { scope.$destroy(); };
      return promise;
    };
  }
]);
