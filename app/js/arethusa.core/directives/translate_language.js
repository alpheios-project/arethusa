"use strict";

angular.module('arethusa.core').directive('translateLanguage', [
  '$translate',
  function($translate) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        function normalizedCurrentKey(key) {
          return key.split('_')[0];
        }

        function useKey(key) {
          scope.langKey = key || normalizedCurrentKey($translate.use());
          $translate.use(scope.langKey);
        }

        var langs = ['en', 'de'];

        function toggleLang() {
          var i;
          i = langs.indexOf(scope.langKey) + 1;
          i = i > langs.length - 1 ? 0 : i;
          useKey(langs[i]);
        }

        element.bind('click', function() {
          scope.$apply(toggleLang);
        });

        useKey();
      },
      templateUrl: 'templates/arethusa.core/translate_language.html'
    };
  }
]);
