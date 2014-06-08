"use strict";

describe('lang-specific directive', function() {
  var $scope;
  var element;
  var documentStore = {
    store: {
      treebank: {
        json: {
          treebank: {}
        }
      }
    }
  };

  beforeEach(module('arethusa.core'));
  beforeEach(module(function($provide) {
    documentStore.store.treebank.json.treebank["_xml:lang"] = "ara";
    $provide.value('documentStore', documentStore);
  }));

  beforeEach(inject(function ($compile, $rootScope) {
    $scope = $rootScope.$new();
    element = angular.element("<span lang-specific />");
    $compile(element)($scope);
  }));

  it('Sets the language for foundation', function() {
    var scope = element.isolateScope();
    expect(scope.lang).toEqual('ara');
  });
});

