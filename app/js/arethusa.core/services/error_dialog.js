"use strict";

/**
 * @ngdoc service
 * @name arethusa.core.errorDialog
 *
 * @description
 * A general purpose error dialog service
 * which offers the user the option to email
 * a stack trace.
 *
 * @requires $modal
 * @requires $rootScope
 */
angular.module('arethusa.core').service('errorDialog', [
  '$modal',
  '$rootScope',
  function($modal, $rootScope, uuid2) {
    function ask(message,trace) {
      var scope = $rootScope.$new();
      scope.message = message;
      scope.trace = trace;
      var promise = $modal.open({
        templateUrl: 'js/arethusa.core/templates/error_dialog.html',
        windowClass: 'error-modal',
        scope: scope
      }).result;
      promise['finally'] = function() { scope.$destroy(); };
      return promise;
    }

/***************************************************************************
 *                            Public Functions                             *
 ***************************************************************************/
    /**
     * @ngdoc function
     * @name arethusa.core.errorDialog#sendError
     * @methodOf arethusa.core.errorDialog
     *
     * @description
     * Displays a dialog notification of an error and provides an option
     * for the user to send an email with a stacktrace from the calling code
     *
     * @param {String} message a brief description of the message
     * @param {Exception} exception (optional - if not supplied stack trace of
     *   the calling function is sent)
     *
     */
    this.sendError = function(message, exception) {
      // this comes from the stacktrace-js library
      var trace = exception ? printStackTrace({e: exception}) : printStackTrace();

      ask(message,trace).then((function(){ }));
    };
  }
]);
