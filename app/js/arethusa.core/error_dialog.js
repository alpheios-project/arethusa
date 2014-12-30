"use strict";

angular.module('arethusa.core').service('errorDialog', [
  '$modal',
  '$rootScope',
  function($modal, $rootScope) {
    this.sendError = function(message) {
      // this comes from the stacktrace-js library
      var trace = printStackTrace();
      // it's a little pointless to do this as a modal dialog really
      // the idea was to send the stack trace on accept but it is a pain
      // to get the coordination of the modal dialog with the uservoice widget right
      // so the errordialog has the user voice widget embedded in it for now
      this.ask(message,trace).then((function(){ }));
    };
    this.ask = function(message,trace) {
      var scope = $rootScope.$new();
      scope.message = message;
      scope.trace = trace;
      var promise = $modal.open({
        templateUrl: 'templates/arethusa.core/error_dialog.html',
        windowClass: 'error-modal',
        scope: scope
      }).result;
      promise['finally'] = function() { scope.$destroy(); };
      return promise;
    };
  }
]);
