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

  var s3 = {
    id: "3",
    tokens: {
      '01': {
        string: 'g',
      },
      '02': {
        string: 'h'
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

  var sentences = [s1, s3, s5];

  beforeEach(module("arethusa.core"));
  beforeEach(inject(function(_navigator_, _state_) {
    navigator = _navigator_;
    state = _state_;
    navigator.reset();
  }));

  describe("this.addSentences()", function() {
    it('adds an array of sentencs to its internal containers', function() {
      navigator.addSentences(sentences);

      // an array of sentences
      expect(navigator.sentences.length).toEqual(3);
      expect(navigator.sentences[0]).toBe(s1);
      expect(navigator.sentences[1]).toBe(s3);
      expect(navigator.sentences[2]).toBe(s5);

      // an object of sentences
      expect(navigator.sentencesById['1']).toBe(s1);
      expect(navigator.sentencesById['5']).toBe(s5);
    });
  });

  describe('this.currentSentence()', function() {
    it('returns the tokens of the current sentence', function() {
      navigator.addSentences(sentences);
      expect(navigator.currentSentence()).toBe(s1.tokens);
    });
  });

  describe('this.state()', function() {
    it('returns the state object', function() {
      expect(navigator.state()).toBe(state);
    });
  });

  describe('this.updateId()', function() {
    it('updates the internal status obj with the id of the current sentence', function() {
      navigator.addSentences(sentences);
      expect(navigator.status.currentId).toBeUndefined();
      navigator.updateId();
      expect(navigator.status.currentId).toEqual('1');
    });
  });

  describe('this.sentenceToString()', function() {
    it('takes a sentence object and returns it as a string', function() {
      var str1 = navigator.sentenceToString(s1);
      var str5 = navigator.sentenceToString(s5);

      expect(str1).toEqual('x y');
      expect(str5).toEqual('a b');
    });
  });

  describe('this.reset()', function() {
    it('flashes all internal state of the navigator', function() {
      navigator.addSentences(sentences);
      navigator.updateId();
      expect(navigator.status.currentId).toEqual('1');
      expect(navigator.sentences.length).toEqual(3);
      expect(navigator.sentencesById).not.toEqual({});

      navigator.reset();
      expect(navigator.status.currentId).toBeUndefined();
      expect(navigator.sentences.length).toEqual(0);
      expect(navigator.sentencesById).toEqual({});
    });
  });

  describe('this.nextSentence()', function() {
    it('moves to the next sentence - mind how ids can be non-sequential!', function() {
      navigator.addSentences(sentences);
      expect(navigator.currentSentence()).toBe(s1.tokens);

      navigator.nextSentence();
      expect(navigator.currentSentence()).toBe(s3.tokens);
    });

    it('updates the state object', function() {
      navigator.addSentences(sentences);
      navigator.nextSentence();
      expect(state.tokens).toBe(navigator.currentSentence());
    });
  });

  describe('this.prevSentence()', function() {
    it('moves to the previous sentence - ids can be non-sequential', function() {
      navigator.addSentences(sentences);
      navigator.nextSentence();
      navigator.nextSentence();
      expect(navigator.currentSentence()).toBe(s5.tokens);

      navigator.prevSentence();
      expect(navigator.currentSentence()).toBe(s3.tokens);
    });

    it('updates the state object', function() {
      navigator.addSentences(sentences);
      navigator.prevSentence();
      expect(state.tokens).toBe(navigator.currentSentence());
    });
  });

  describe('this.goToLast()', function() {
    it('goes to the last element in the sentences array', function() {
      navigator.addSentences(sentences);

      navigator.goToLast();
      expect(navigator.currentSentence()).toBe(s5.tokens);
    });

    it('updates the state object', function() {
      navigator.addSentences(sentences);
      navigator.goToLast();
      expect(state.tokens).toBe(navigator.currentSentence());
    });
  });

  describe('this.goToFirst', function() {
    it('goes. to the first element in the sentence array', function() {
      navigator.addSentences(sentences);
      navigator.goToLast();
      expect(navigator.currentSentence()).toBe(s5.tokens);

      navigator.goToFirst();
      expect(navigator.currentSentence()).toBe(s1.tokens);
    });

    it('updates the state object', function() {
      navigator.addSentences(sentences);
      navigator.goToLast();
      navigator.goToFirst();
      expect(state.tokens).toBe(navigator.currentSentence());
    });
  });

  describe('this.goTo()', function() {
    it('goes to a sentence identified by its id', function() {
      navigator.addSentences(sentences);

      navigator.goTo('3');
      expect(navigator.currentSentence()).toBe(s3.tokens);

      navigator.goTo('5');
      expect(navigator.currentSentence()).toBe(s5.tokens);
    });

    it('updates the state object', function() {
      navigator.addSentences(sentences);
      navigator.goTo('5');
      expect(state.tokens).toBe(navigator.currentSentence());
    });
  });

  describe('this.hasNext()', function() {
    it('determines if a next sentence is available', function() {
      navigator.addSentences(sentences);

      expect(navigator.hasNext()).toBeTruthy();

      navigator.goTo('5');
      expect(navigator.hasNext()).toBeFalsy();
    });
  });

  describe('navigator.hasPrev()', function() {
    it('determines if a previous sentence is available', function() {
      navigator.addSentences(sentences);

      expect(navigator.hasPrev()).toBeFalsy();

      navigator.goTo('3');
      expect(navigator.hasPrev()).toBeTruthy();
    });
  });

  describe('this.switchView()', function() {
    it('switches between editor and list mode', function() {
      expect(navigator.listMode).toBeFalsy();
      navigator.switchView();
      expect(navigator.listMode).toBeTruthy();
      navigator.switchView();
      expect(navigator.listMode).toBeFalsy();
    });

    xit('toggles hiding of the editor and list DOM elements', function() {
    });
  });
});
