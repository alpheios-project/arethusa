"use strict";

angular.module('arethusa.core').directive('sentenceList', [
  '$compile',
  'navigator',
  function($compile, navigator) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.n = navigator;

        function createList() {
          // We want this to load only once, and only if
          // a user requests it!
          if (! navigator.hasList) {
            var template = '\
              <p/>\
              <div class="row panel">\
                <ul class="sentence-list">\
                  <li \
                    class="sentence-list"\
                    sentence="s"\
                    ng-repeat="s in n.sentences">\
                  </li>\
                </ul>\
              </div>\
            ';

            navigator.list().append($compile(template)(scope));
            navigator.hasList = true;
          }
        }

        scope.$on('viewModeSwitched', createList);

        element.bind('click', function() {
          createList();
          scope.$apply(function() {
            navigator.switchView();
          });
        });
      }
    };
  }
]);
