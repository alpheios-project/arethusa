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

  function toWord(idAndForm) {
    return '<word id="' + idAndForm[0] + '" form="' + idAndForm[1] + '"/>';
  }

  function toSentence(idAndWords) {
    var ws =  aU.map(idAndWords[1], toWord).join('');
    return '<sentence id="' + idAndWords[0] + '">' + ws + '</sentence>';
  }

  function toTreebank(sentences) {
    var ss = aU.map(sentences, toSentence).join('');
    return '<treebank>' + ss + '</treebank>';
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
  });
});
