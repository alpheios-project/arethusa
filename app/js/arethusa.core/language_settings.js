"use strict";

angular.module('arethusa.core').service('languageSettings', [
  'documentStore',
  function(documentStore) {
    var self = this;

    this.languageSpecifics = {
      'ara' : {
        name: 'Arabic',
        lang: 'ar',
        leftToRight: false,
        font: 'Amiri'
      },
      'grc' : {
        name: 'Greek',
        lang: 'gr',
        leftToRight: true
      }
    };

    this.langNames = arethusaUtil.inject({}, self.languageSpecifics, function(memo, code, obj) {
      memo[obj.lang] = obj.name;
    });

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
