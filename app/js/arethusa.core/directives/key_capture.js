'use strict';

/**
 * @ngdoc directive
 * @name keyCapture
 * @restrict A
 *
 * @description
 * Captures keydown and keyup events on the element and
 * delegates the event handling to the keyCapture service.
 *
 * @example
   <example module="arethusa.core">
     <file name="service.js">
        angular.module('arethusa.core').service('keyCapture', function() {
          this.keydown = function(event) {
            console.log(event);
          };
        });
     </file>
     <file name="index.html">
      <div keyCapture>
        Some awesome stuff
      </div>
     </file>
   </example>
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
