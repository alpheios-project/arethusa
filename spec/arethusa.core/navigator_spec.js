"use strict";

describe("navigator", function() {
  var navigator;
  var state;

  var s1 = {
    id: "1",
    tokens: {
      '01': {
        string: 'x',
      },
      '02': {
        string: 'y'
      }
    }
  };

  var s5 = {
    id: "5",
    tokens: {
      '01': {
        string: 'a',
      },
      '02': {
        string: 'b'
      }
    }
  };

  var sentences = [s1, s5];

  beforeEach(module("arethusa.core"));
  beforeEach(inject(function(_navigator_, _state_) {
    navigator = _navigator_;
    state = _state_;
    navigator.reset();
  }));

  describe("this.addSentences", function() {
    it('adds an array of sentencs to its internal containers', function() {
      navigator.addSentences(sentences);

      // an array of sentences
      expect(navigator.sentences.length).toEqual(2);
      expect(navigator.sentences[0]).toBe(s1);
      expect(navigator.sentences[1]).toBe(s5);

      // an object of sentences
      expect(navigator.sentencesById['1']).toBe(s1);
      expect(navigator.sentencesById['5']).toBe(s5);
    });
  });

  describe('this.currentSentence', function() {
    it('returns the tokens of the current sentence', function() {
      navigator.addSentences(sentences);
      expect(navigator.currentSentence()).toBe(s1.tokens);
    });
  });
});
