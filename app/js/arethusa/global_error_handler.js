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
