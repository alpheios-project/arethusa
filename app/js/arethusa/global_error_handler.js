"use strict";

angular.module('arethusa').factory('GlobalErrorHandler', [
  '$window',
  '$analytics',
  function($window, $analytics) {
    var oldErrorHandler = $window.onerror;
    $window.onerror = function errorHandler(errorMessage, url, lineNumber) {
      $analytics.eventTrack(errorMessage + " @" + url + " : " + lineNumber, {
        category: 'error', label: errorMessage
      });
      if (oldErrorHandler)
        return oldErrorHandler(errorMessage, url, lineNumber);

      return false;
    };
  }
]);

angular.module('arethusa').factory('$exceptionHandler', [
  '$analytics',
  '$log',
  function($analytics, $log) {
    return function(exception, cause) {
      $log.error.apply($log, arguments);
      $analytics.eventTrack(exception + ": " + cause, {
        category: 'error', label: exception
      });
    };
  }
]);
