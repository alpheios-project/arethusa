"use strict";

angular.module('arethusa.core').service('languageSettings', [
  'documentStore',
  function(documentStore) {
    this.languageSpecifics = {
      'ara' : {
        lang: 'ar',
        leftToRight: false,
        font: 'Amiri'
      },
      'grc' : {
        lang: 'gr',
        leftToRight: true
      }
    };

    this.getFor = function(documentName) {
      var document = documentStore.store[documentName];
      if (document === undefined) {
        return undefined;
      }

      var lang = document.json.treebank["_xml:lang"];
      if (lang in this.languageSpecifics) {
        return this.languageSpecifics[lang];
      }

      return undefined;
    };
  }
]);
