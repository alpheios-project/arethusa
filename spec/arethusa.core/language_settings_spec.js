
"use strict";

describe('lang-specific directive', function() {
  var documentStore;
  function createDocumentStore() {
    return {
      store: {
        treebank: {
          json: {
            treebank: {}
          }
        }
      }
    };
  }

  beforeEach(module('arethusa.core'));

  describe('getFor', function() {
    describe('defined language', function() {
      beforeEach(module(function($provide) {
        documentStore = createDocumentStore();
        documentStore.store.treebank.json.treebank["_xml:lang"] = "ara";
        $provide.value('documentStore', documentStore);
      }));

      it('returns the language settings', inject(function(languageSettings) {
        var settings = languageSettings.getFor('treebank');
        expect(settings).toBeDefined();
        expect(settings.lang).toBeDefined();
        expect(settings.leftToRight).toBeDefined();
      }));
    });

    describe('unspecified language', function() {
      beforeEach(module(function($provide) {
        documentStore = createDocumentStore();
        $provide.value('documentStore', documentStore);
      }));

      it('returns undefined', inject(function(languageSettings) {
        expect(languageSettings.getFor('treebank')).toBeUndefined();
      }));
    });

    describe('not existing document', function() {
      it('returns undefined', inject(function(languageSettings) {
        expect(languageSettings.getFor('not existing')).toBeUndefined();
      }));
    });
  });
});
