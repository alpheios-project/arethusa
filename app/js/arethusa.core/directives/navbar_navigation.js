"use strict";

angular.module('arethusa.core').directive('navbarNavigation', [ 
  'navigator',
  function(navigator) {
    return {
      restrict: 'A',
      replace: true,
      controller: 'NavigatorCtrl',
      link: function(scope, element, attrs) {
        scope.nav = navigator;

        scope.$watch('windowWidth', function(newVal, oldVal) {
          scope.collapseCitation();
        });
        scope.$watch('nav.status.citation', function(newVal, oldVal) {
          debugger;
          scope.collapseCitation();
        });
        // function to determine if the navbar should be flagged as collapsed, based upon
        // the current width of the window and the length of the currently displayed citation 
        // a long citation in a narrow window needs to have its containing element width restricted
        // so that it doesn't push other required navbar elements off the display
        // but we only want to do this if absolutely necessary to avoid adding unnecessary display
        // elements like scrollbars when we don't need them
        scope.collapseCitation = function() {
          // TODO really the settings for max width and max citation length should be configuration settings

          // we might called before the citation has been populated so we have to check to be sure we have one before
          // testing its length
          if (scope.windowWidth < 1130 && scope.nav.status && scope.nav.status.citation && scope.nav.status.citation.length  > 25) {
            element.addClass("collapsed");
          } else {
            element.removeClass("collapsed");
          }
        }
      },

      templateUrl: 'templates/arethusa.core/navbar_navigation.html'
    };
  }
]);
