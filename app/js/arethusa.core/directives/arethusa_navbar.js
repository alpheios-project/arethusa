'use strict';
/* Configurable navbar
 *
 * The following variables can be declared in a conf file
 *   disable - Boolean
 *   search - Boolean
 *   navigation - Boolean
 *   template - String
 *
 * Example;
 *
 * {
 *   "navbar" : {
 *     "search" : true,
 *     "navigation" : true,
 *     "template" : "js/templates/navbar.html"
 *   }
 *
 */
angular.module('arethusa.core').directive('arethusaNavbar', [
  'configurator',
  '$window',
  function (configurator, $window) {
    return {
      restrict: 'AE',
      scope: true,
      link: function (scope, element, attrs) {
        var conf = configurator.configurationFor('navbar');

        var win = angular.element($window);

        function setScreenValues() {
          setWindowWidth();
          setLogo();
        }

        function setWindowWidth() {
          scope.windowWidth = win.width();
        }

        function setLogo() {
          var icon = scope.windowWidth > 1300 ? '' : 'icon-';
          scope.logo = conf.logo;
        }

        function isVisible(threshold, defaultVal) {
          if (defaultVal) {
            return scope.windowWidth > threshold;
          }
        }

        setScreenValues();
        win.on('resize', setScreenValues);

        scope.template = conf.template;
        scope.disable = conf.disable;

        scope.showSearch = function () {
          return conf.search;
        };

        scope.showNavigation = function () {
          return conf.navigation;
        };

      },
      template: '<div ng-if="!disable" ng-include="template"></div>'
    };
  }
]);
