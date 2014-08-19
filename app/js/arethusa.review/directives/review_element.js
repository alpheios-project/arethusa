"use strict";

// This is severly hacky as it hardcodes stuff - only an interim solution

angular.module('arethusa.review').directive('reviewElement', [
  'review',
  'morph',
  'state',
  function(review, morph, state) {
    return {
      restrict: 'A',
      scope: {
        cat: '=reviewElement',
        diff: '='
      },
      link: function(scope, element, attrs) {
        function initHeadDiff() {
          var arr = scope.diff.id;
          switch (arr.length) {
            case 1:
              break;
            case 2:
              scope.wrong = state.getToken(arr[0]);
              scope.right = state.getToken(arr[1]);
              break;
            case 3:
              break;
          }
        }

        function initRelationDiff() {
          var arr = scope.diff.label;
          switch (arr.length) {
            case 1:
              break;
            case 2:
              scope.wrong = arr[0];
              scope.right = arr[1];
              break;
            case 3:
              break;
          }

        }

        function initMorphDiff() {
          scope.errors = [];
          var lDiff = scope.diff.lemma;
          if (lDiff) scope.errors.push(lDiff);
        }

        function init() {
          if (scope.cat === 'head')       initHeadDiff();
          if (scope.cat === 'relation')   initRelationDiff();
          if (scope.cat === 'morphology') initMorphDiff();

          scope.template = 'templates/arethusa.review/review_element_' + scope.cat + '.html';
        }

        scope.$watch('cat', init);
      },
      template: '<div ng-include="template"/>'
    };
  }
]);
