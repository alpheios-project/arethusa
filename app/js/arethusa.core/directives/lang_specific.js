'use strict';

angular.module('arethusa.core').directive('langSpecific',
  ['documentStore',
  function(documentStore) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        // TODO change first treebank to dynamic value
        var lang = documentStore.store.treebank.json.treebank["_xml:lang"];
        var languageSpecifics = {
          'ara' : {
            lang: 'ar',
            leftToRight: false
          }
        };

        if (lang in languageSpecifics) {
          var specifics = languageSpecifics[lang];
          element.attr('lang', specifics.lang);
          element.attr('dir', specifics.leftToRight ? 'ltr' : 'rtl');
        }
      }
    };
  }
]);
