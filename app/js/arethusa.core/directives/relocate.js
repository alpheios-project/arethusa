"use strict";

/**
 * @ngdoc directive
 * @name arethusa.core.directives:relocate
 * @restrict A
 *
 * @description
 * display a list of one or more locations each of which triggers
 * a click event which triggers
 * {@link arethusa.core.relocateHandler#methods_relocate relocateHandler#relocate},
 * when one or more relocate url is defined in the {@link arethusa.core.relocateHandler relocateHandler},
 *
 * @requires arethusa.core.relocateHandler
 * @requires arethusa.core.translator
 */
angular.module('arethusa.core').directive('relocate', [
  'relocateHandler',
  'translator',
  function(relocateHandler, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        if (relocateHandler.defined) {
          scope.locations = relocateHandler.locations;
          scope.relocate = function(loc) {
              relocateHandler.relocate(loc);
            };
        } 
      },
      templateUrl: 'templates/arethusa.core/relocate.html'
    };
  }
]);
