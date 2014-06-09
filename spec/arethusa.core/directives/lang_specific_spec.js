"use strict";

describe('lang-specific directive', function() {
  var element;
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

  var createElement = function() {
    inject(function ($compile, $rootScope) {
      var $scope = $rootScope.$new();
      element = angular.element("<span lang-specific />");
      $compile(element)($scope);
    });
  };

  describe('Arabic', function() {
    beforeEach(module(function($provide) {
      documentStore = createDocumentStore();
      documentStore.store.treebank.json.treebank["_xml:lang"] = "ara";
      $provide.value('documentStore', documentStore);
    }));

    beforeEach(function() {
      createElement();
    });

    it('sets the language on the html element', function() {
      expect(element.attr('lang')).toEqual('ar');
    });
  });

  describe('unspecified language', function() {
    beforeEach(module(function($provide) {
      documentStore = createDocumentStore();
      $provide.value('documentStore', documentStore);
    }));

    beforeEach(function() {
      createElement();
    });

    it('does not set any language on the html element', function() {
      expect(element.attr('lang')).toBeUndefined();
    });
  });
});

