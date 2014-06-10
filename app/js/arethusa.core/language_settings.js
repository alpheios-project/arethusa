"use strict";

angular.module('arethusa.core').service('languageSettings', [
  'documentStore',
  function(documentStore) {
    this.languageSpecifics = {
      'ara' : {
        lang: 'ar',
        leftToRight: false
      }
    };

    this.getFor = function(document) {
      var lang = documentStore.store[document].json.treebank["_xml:lang"];
      if (lang in this.languageSpecifics) {
        return this.languageSpecifics[lang];
      }

      return undefined;
    };
  }
]);
