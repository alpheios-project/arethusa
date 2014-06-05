"use strict";

describe('treebank persister', function() {
  var $httpBackend;
  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
    getServices: function(name) {
      return [];
    }
  };

  beforeEach(module('arethusa', function($provide) {
    $provide.value('configurator', mockConfigurator);
  }));

  beforeEach(inject(function($injector, documentStore) {
    $httpBackend = $injector.get('$httpBackend');
  }));

  it('description', inject(function(TreebankPersister) {
    var persister = new TreebankPersister();
    // persister.udateDocument();
  }));
});
