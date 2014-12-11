'use strict';

/**
 * @ngdoc directive
 * @name arethusa.core.directives:keyCapture
 * @restrict A
 *
 * @description
 * Captures keydown and keyup events on the element and
 * delegates the event handling to the keyCapture service.
 *
 * @requires arethusa.core.keyCapture
 */
angular.module('arethusa.core').directive('keyCapture', [
  'keyCapture',
  function (keyCapture) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.on('keydown', function (event) {
          keyCapture.keydown(event);
        });
        element.on('keyup', function (event) {
          keyCapture.keyup(event);
        });
      }
    };
  }
]);
