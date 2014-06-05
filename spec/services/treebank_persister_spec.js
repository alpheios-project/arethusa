"use strict";

describe('treebank persister', function() {
  var $httpBackend;
  var documentStore;
  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
    getServices: function(name) {
      return [];
    },
    provideResource: function(name) {
      return {
        'obj' : {
          'save' : function() {
          }
        }
      };
    }
  };
  var mockNavigator = {
    sentencesById: {
      "2": {
        "tokens": {
          "0001": {
            relation: {
              id: 2
            }
          },
          "0002": {
            relation: {
              id: 0
            }
          }
        }
      }
    }
  };

  beforeEach(module('arethusa', function($provide) {
    $provide.value('configurator', mockConfigurator);
    $provide.value('navigator', mockNavigator);
  }));

  beforeEach(inject(function($injector, _documentStore_) {
    $httpBackend = $injector.get('$httpBackend');
    documentStore = _documentStore_;
    documentStore.addDocument('some-treebank', {
      json: {
        "treebank": {
          "sentence": {
            "_id": 2,
            "word": [
              {
              "_id": "1",
              "_form": "Coniurandi",
              "_lemma": "conjuro1",
              "_postag": "t-spdang-",
              "_head": "4",
              "_relation": "ATR"
            },
            {
              "_id": "2",
              "_form": "has",
              "_lemma": "hic1",
              "_postag": "p-p---fa-",
              "_head": "3",
              "_relation": "PNOM"
            }]
          }
        }
      }
    });
  }));

  it('description', inject(function(TreebankPersister) {
    var conf = {
      'resource' : 'test-resource',
      'docIdentifier' : 'some-treebank'
    };
    var persister = new TreebankPersister(conf);

    expect(persister).toBeDefined();

    persister.saveData(function() {});
  }));
});
