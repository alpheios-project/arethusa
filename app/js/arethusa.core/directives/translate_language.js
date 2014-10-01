"use strict";

angular.module('arethusa.core').directive('translateLanguage', [
  '$translate',
  'translator',
  'LOCALES',
  function($translate, translator, LOCALES) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var langKey;

        function useKey(key) {
          langKey = key || $translate.use() || 'en';
          $translate.use(langKey);
          scope.lang = langKey;
        }

        function toggleLang() {
          var i;
          i = LOCALES.indexOf(langKey) + 1;
          i = i > LOCALES.length - 1 ? 0 : i;
          useKey(LOCALES[i]);
        }

        element.bind('click', function() {
          scope.$apply(toggleLang);
        });

        var parent = element.parent();
        translator('language', function(translation) {
          parent.attr('title', translation);
        });

        useKey();
      },
      templateUrl: 'templates/arethusa.core/translate_language.html'
    };
  }
]);
