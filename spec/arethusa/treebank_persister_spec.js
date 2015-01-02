"use strict";

describe('treebank persister', function() {
  var documentStore;
  var TreebankPersister;
  var state;
  var idHandler;
  var docId = 'some-treebank';
  var noop = function() {};


  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
    getServices: function(name) {
      return [];
    },
    provideResource: function(name) {
      return {
        'save' : function() {
          return { then: function() {} };
        }
      };
    }
  };

  var t1 = {
    id: '0001',
    head: {
      id: ''
    },
  };

  var t2 = {
    id: '0002',
    head: {
      id: '0000'
    },
  };
  var s2 = {
    "tokens": {
      "0001": t1,
      "0002": t2
    },
    id: '2'
  };

  beforeEach(module('arethusa', function($provide) {
    $provide.value('configurator', mockConfigurator);
  }));

  beforeEach(inject(function(
    _documentStore_, _TreebankPersister_, _state_, _idHandler_, _navigator_) {
    TreebankPersister = _TreebankPersister_;
    documentStore = _documentStore_;
    state = _state_;
    idHandler = _idHandler_;
    _navigator_.init();
    _navigator_.addSentences([s2]);
    documentStore.reset();
    documentStore.addDocument(docId, {
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
              "_head": "",
              "_relation": "ATR"
            },
            {
              "_id": "2",
              "_form": "has",
              "_lemma": "hic1",
              "_postag": "p-p---fa-",
              "_head": "0",
              "_relation": "PNOM"
            }]
          }
        }
      }
    });

    var m1 = new idHandler.Map();
    var m2 = new idHandler.Map();

    m1.add(docId, '0001', '1', 2);
    m2.add(docId, '0002', '2', 2);

    t1.idMap = m1;
    t2.idMap = m2;

    state.replaceState(s2.tokens);
  }));

  describe('this.saveData()', function() {
    var conf, persister;

    beforeEach(function() {
      conf = {
        'resource' : 'test-resource',
        'docIdentifier' : docId
      };
      persister = new TreebankPersister(conf);
    });

    it('saves data when when changes are present', function() {
      expect(persister).toBeDefined();

      state.change('0001', 'head.id', '0002');

      var updatedDoc = documentStore.store[docId];
      persister.saveData(function() {});

      expect(updatedDoc).toBeDefined();
      expect(updatedDoc.json.treebank.sentence.word[0]._head).toBe('2');
    });

    it('does not update when chunk is not marked as changed', function() {
      expect(persister).toBeDefined();

      var updatedDoc = documentStore.store[docId];
      var firstHead = function() {
        return updatedDoc.json.treebank.sentence.word[0]._head;
      };
      var valBeforeSave = firstHead();

      persister.saveData(noop);

      expect(updatedDoc).toBeDefined();
      expect(firstHead()).toBe(valBeforeSave);
    });

    describe('with newly added tokens', function() {
      var aT1, aT2;

      beforeEach(function() {
        function ArtificialToken(id, str) {
          this.id = id;
          this.string = str;
          this.type = 'artificial';
          this.artificial = true;
          this.sentenceId = '2';
          this.idMap = new idHandler.Map();
        }

        aT1 = new ArtificialToken('0002e', '[1]');
        aT2 = new ArtificialToken('0002f', '[2]');
      });

      function parse(xml) {
        return arethusaUtil.xml2json(xml);
      }

      function areIdsSequential(words) {
        var last = words[words.length - 1];
        var sequential = true;
        for (var i=0; i < words.length; i++) {
          var word = words[i];
          if (word !== last) {
            var next = words[i + 1];
            if ((parseInt(word._id) + 1) !== parseInt(next._id)) {
              sequential = false;
              break;
            }
          }
        }
        return sequential;
      }

      it('handles insertion of one artificial tokens properly', function() {
        state.addToken(aT1, aT1.token);

        var doc = documentStore.store[docId];
        var words = doc.json.treebank.sentence.word;

        expect(words.length).toEqual(2);
        persister.saveData(noop);

        expect(words.length).toEqual(3);

        // check if token made it to the xml by reparsing and checking it
        var fromXml = parse(doc.xml);
        var newWords = fromXml.treebank.sentence.word;

        expect(newWords.length).toEqual(3);

        // new id of the inserted token should be sequential
        expect(areIdsSequential(newWords)).toBeTruthy();
      });

      it('handles insertion of two artificial tokens properly', function() {
        state.addToken(aT1, aT1.id);
        state.addToken(aT2, aT2.id);

        var doc = documentStore.store[docId];
        var words = doc.json.treebank.sentence.word;

        expect(words.length).toEqual(2);
        persister.saveData(noop);

        expect(words.length).toEqual(4);

        var testArtificialTokens = function(words) {
          expect(words.length).toEqual(4);
          // new id of the inserted token should be sequential
          expect(areIdsSequential(words)).toBeTruthy();

          // check if sourceMappings are OK
          expect(aT1.idMap.sourceId(docId)).toEqual(3);
          expect(aT2.idMap.sourceId(docId)).toEqual(4);
        };

        // check if token made it to the xml by reparsing and checking it
        var newWords = parse(doc.xml).treebank.sentence.word;
        testArtificialTokens(newWords);

        // resaving is not destroying the document
        persister.saveData(noop);

        var updatedWords = parse(doc.xml).treebank.sentence.word;
        testArtificialTokens(updatedWords);

        // and resaving is not destroying the document after a change has been made
        state.change('0001', 'head.id', '0000');
        persister.saveData(noop);

        updatedWords = parse(doc.xml).treebank.sentence.word;
        testArtificialTokens(updatedWords);
      });
    });
  });
});
