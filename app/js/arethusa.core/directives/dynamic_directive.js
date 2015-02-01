"use strict";


/**
 * @ngdoc directive
 * @name arethusa.core.directives:dynamicDirective
 * @restrict A
 * @scope
 *
 * @description
 * Allows to dynamically add a self-contained directive
 *
 * A very dumb directive which just takes an input string and tries to
 * append this input string as compiled directive.
 *
 * Mind that this is not very sophisticated yet (limited to our current
 * use case):
 *
 * - The directive needs to be self contained, i.e. it cannot take any
 *   arguments on its own.
 * - It needs to be valid as attribute directive
 * - The compilation is only done once - no watcher is placed on the
 *   attribute, so if its value changes nothing happens.
 *
 * The directive tries to honor the tag the directive was placed on,
 * two examples:
 *
 * ```html
 * <div dynamic-directive="layout-setting"></div>
 *
 * <span dynamic-direcitve="layout-setting"></span>
 * ```
 *
 * The first `layoutSetting` directive will be compiled on a `div` element,
 * the second on a `span` element.
 *
 * ```html
 * <div layout-setting></div>
 *
 * <span layout-setting></span>
 * ```
 *
 * @param {string} dynamicDirective The name of the directive to be compiled
 *
 * @requires $compile
 */
angular.module('arethusa.core').directive('dynamicDirective', [
  '$compile',
  function($compile) {
    return {
      restrict: 'A',
      scope: {
        directive: '@dynamicDirective'
      },
      link: function(scope, element, attrs) {
        var tag = element[0].tagName.toLowerCase();
        var tmpl = '<' + tag + ' ' + scope.directive + '></' + tag + '>';
        element.append($compile(tmpl)(scope.$parent));
      }
    };
  }
]);
