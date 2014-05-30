"use strict";

angular.module('arethusa.core').directive('sentenceList', [
  '$compile',
  'navigator',
  function($compile, navigator) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.n = navigator;


        element.bind('click', function() {
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
          scope.$apply(function() {
            navigator.switchView();
          });
        });
      }
    };
  }
]);
