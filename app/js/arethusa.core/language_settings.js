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
      },
      'heb' : {
        name: 'Hebrew',
        lang: 'he',
        leftToRight: false
      }
    };

    this.langNames = arethusaUtil.inject({}, self.languageSpecifics, function(memo, code, obj) {
      memo[obj.lang] = obj.name;
    });

    var settings = {};
    this.setFor = function(documentName, lang) {
      settings[documentName] = self.languageSpecifics[lang];
    };

    this.getFor = function(documentName) {
      var cached = settings[documentName];
      if (cached) {
        return cached;
      } else {
        var document = documentStore.store[documentName];
        if (document === undefined) {
          return undefined;
        }

        var lang = document.json.treebank["_xml:lang"];
        if (lang in self.languageSpecifics) {
          var langObj = self.languageSpecifics[lang];
          self.setFor('treebank', langObj);
          return langObj;
        }

        return undefined;
      }
    };
  }
]);
