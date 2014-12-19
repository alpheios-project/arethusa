'use strict';

describe('TreebankRetriever', function() {
  var retriever;

  beforeEach(function() {
    module("arethusa.core", function($provide) {
      $provide.value('configurator', arethusaMocks.configurator());
    });

    module("arethusa");

    inject(function(TreebankRetriever) {
      retriever = new TreebankRetriever({});
    });
  });

  function makePrefix(pfx) {
    return pfx ? pfx + ':' : '';
  }

  function toWord(idAndForm, pfx) {
    return '<' + makePrefix(pfx) + 'word id="' + idAndForm[0] + '" form="' + idAndForm[1] + '"/>';
  }

  function toSentence(idAndWords, pfx) {
    var ws =  aU.map(idAndWords[1], toWord, pfx).join('');
    return '<' + makePrefix(pfx) + 'sentence id="' + idAndWords[0] + '">' + ws + '</' + makePrefix(pfx) + 'sentence>';
  }

  function toTreebank(sentences) {
    var ss = aU.map(sentences, toSentence).join('');
    return '<treebank>' + ss + '</treebank>';
  }

  function toNsTreebank(sentences) {
    var ss = aU.map(sentences, toSentence, 'ns1').join('');
    return '<ns1:treebank xmlns:ns1="http://example.org/ns">' + ss + '</ns1:treebank>';
  }

  describe('parse', function() {
    var result;
    beforeEach(function() { result = undefined; });

    function callback(sentences) {
      result = sentences;
    }

    it('parses treebank data in XML format and returns an array of sentences', function() {
      var tb = toTreebank([[1, [[1, 'a'], [2, 'b']]], [2, [[1, 'a'], [2, 'b']]]]);
      retriever.parse(tb, callback);
      expect(result.length).toEqual(2); // 2 sentences

      var s1 = result[0];
      var s2 = result[1];

      expect(s1.id).toBeDefined();

      var tokenIds = Object.keys(s1.tokens);
      expect(tokenIds.length).toEqual(2); // 2 tokens
      expect(s1.tokens[tokenIds[0]].string).toEqual('a');
    });

    it('does not fail when a treebank consists of a single sentence', function() {
      var tb = toTreebank([[1, [[1, 'a'], [2, 'b']]]]);
      retriever.parse(tb, callback);
      expect(result.length).toEqual(1); // 1 sentence
    });

    // Tests the bug described in http://github.com/latin-language-toolkit/arethusa/issues/440
    it('does not fail when a sentence consists of a single word', function() {
      var tb = toTreebank([[1, [[1, 'a']]]]);
      retriever.parse(tb, callback);

      var tokenIds = Object.keys(result[0].tokens);
      expect(tokenIds.length).toEqual(1); // 1 token
    });
    
    // Test that namespaced treebank files are also okay
    // But not that this test is of limited value due to
    // https://github.com/ariya/phantomjs/issues/10428
    it('succeeds when a treebank is namespace prefixed', function() {
      var tb = toNsTreebank([[1, [[1, 'a']]]]);
      retriever.parse(tb, callback);

      var tokenIds = Object.keys(result[0].tokens);
      var s1 = result[0];
      expect(tokenIds.length).toEqual(1); 
      expect(s1.id).toBeDefined();
      expect(s1.tokens[tokenIds[0]].string).toEqual('a');
    });
  });
});
