"use strict";

angular.module('arethusa.morph').directive('mirrorMorphForm', [
  'morph',
  '$location',
  '$anchorScroll',
  function(morph, $location, $anchorScroll) {
    return {
      restrict: 'A',
      scope: {
        form: '=mirrorMorphForm',
        tokenId: '='
      },
      link: function(scope, element, attrs) {
        var morphToken = morph.analyses[scope.tokenId];
        var menuId = 'mfc' + scope.tokenId;

        function newCustomForm() {
          var form = angular.copy(scope.form);

          // We might want to clean up even more here - such as the
          // lexical inventory information. Revisit later.
          delete form.origin;

          return form;
        }

        element.bind('click', function() {
          scope.$apply(morphToken.customForm = newCustomForm());
          $location.hash(menuId);
          angular.element(document.getElementById(menuId)).removeClass('hide');

          // Sadly doesn't have any smooth scroll capabilities - we might have to
          // change this implementation at some point.
          $anchorScroll();
        });
      }
    };
  }
]);
