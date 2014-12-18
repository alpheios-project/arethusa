"use strict";

/**
 * @ngdoc directive
 * @name arethusa.core.directives:exit
 * @restrict A
 *
 * @description
 * Adds a click event and an exit icon, which triggers
 * {@link arethusa.core.exitHandler#methods_leave exitHandler#leave},
 * when an exit route is defined in the {@link arethusa.core.exitHandler exitHandler},
 * otherwise will hides the element decorated with this directive.
 *
 * @requires arethusa.core.exitHandler
 * @requires arethusa.core.translator
 */
angular.module('arethusa.core').directive('exit', [
  'exitHandler',
  'translator',
  function(exitHandler, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        if (exitHandler.defined) {
          element.bind('click', function(event) {
            var targetWin;
            var button = event.button;
            // Mirroring the different behavior of left and middle click
            if (button === 0) targetWin = "_self";
            if (button === 1) targetWin = "_blank";

            // We don't pass targetWin and hardcode _self for now as we don't
            // want the user to exit to a new tab - we leave the code in
            // though, in case we change our mind one day.

            exitHandler.leave("_self");
          });

          translator('exitHandler.exitTo', function(trsl) {
            element.attr('title', trsl({ title: exitHandler.title }));
          });
        } else {
          element.hide(); // or even remove?
        }


      },
      template: '<i class="fa fa-sign-out"></i>'
    };
  }
]);
