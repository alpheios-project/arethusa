"use strict";

angular.module('arethusa').factory('GlobalErrorHandler', [
  '$window',
  '$analytics',
  function($window, $analytics) {
    var oldErrorHandler = $window.onerror;
    $window.onerror = function errorHandler(errorMessage, url, lineNumber) {
      var trace = printStackTrace();
      $analytics.eventTrack(errorMessage + " @" + url + " : " + lineNumber, {
        category: 'error', label: trace.join(', ')
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
    return function errorHandler(exception, cause) {
      $log.error.apply($log, arguments);
      var trace = printStackTrace();
      $analytics.eventTrack(exception + ': ' + cause, {
        category: 'error', label: trace.join(', ')
      });
    };
  }
]);
