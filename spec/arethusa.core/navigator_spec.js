"use strict";

describe("navigator", function() {
  var navigator;
  var state;

  var s1 = {
    id: "1",
    tokens: {
      '01-01': {
        string: 'x',
        sentenceId: '1',
        id: '01-01'
      },
      '01-02': {
        string: 'y',
        sentenceId: '1',
        id: '01-02'
      }
    }
  };

  var s3 = {
    id: "3",
    tokens: {
      '03-01': {
        string: 'g',
        sentenceId: '3',
        id: '03-01'
      },
      '03-02': {
        string: 'h',
        sentenceId: '3',
        id: '03-02'
      }
    }
  };

  var s5 = {
    id: "5",
    tokens: {
      '05-01': {
        string: 'a',
        sentenceId: '5',
        id: '05-01'
      },
      '05-02': {
        string: 'b',
        sentenceId: '5',
        id: '05-02'
      }
    }
  };

  var sentences = [s1, s3, s5];

  beforeEach(module("arethusa.core", function($provide) {
    $provide.value('configurator', arethusaMocks.configurator());
  }));

  beforeEach(inject(function(_navigator_, _state_) {
    navigator = _navigator_;
    state = _state_;
    state.initServices(); // executes navigator init
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

  describe('this.currentChunk()', function() {
    it('returns the tokens of the current sentence', function() {
      navigator.addSentences(sentences);
      expect(navigator.currentChunk()).toEqual(s1.tokens);
    });

    describe('with a larger chunk size', function() {
      it('returns more than one sentence', function() {
        var res = angular.extend({}, s1.tokens, s3.tokens);
        navigator.addSentences(sentences);

        navigator.changeChunkSize(2);

        expect(navigator.currentChunk()).toEqual(res);
      });
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
      expect(navigator.status.currentIds).toEqual([]);
      navigator.updateId();
      expect(navigator.status.currentIds).toEqual(['1']);
    });

    it('determines if a next and/or previous sentence is available', function() {
      navigator.addSentences(sentences);
      navigator.updateId();
      expect(navigator.status.hasNext).toBeTruthy();
      expect(navigator.status.hasPrev).toBeFalsy();

      navigator.nextChunk(); // calls updateId on its own
      expect(navigator.status.hasNext).toBeTruthy();
      expect(navigator.status.hasPrev).toBeTruthy();

      navigator.nextChunk();
      expect(navigator.status.hasNext).toBeFalsy();
      expect(navigator.status.hasPrev).toBeTruthy();
    });

    it('updates the status object with the current chunk position', function() {
      navigator.addSentences(sentences);
      navigator.updateId();
      expect(navigator.status.currentPos).toEqual(0);
      navigator.nextChunk();
      expect(navigator.status.currentPos).toEqual(1);
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
      expect(navigator.status.currentIds).toEqual(['1']);
      expect(navigator.sentences.length).toEqual(3);
      expect(navigator.sentencesById).not.toEqual({});

      navigator.reset();
      expect(navigator.status.currentId).toBeUndefined();
      expect(navigator.sentences.length).toEqual(0);
      expect(navigator.sentencesById).toEqual({});
    });
  });

  describe('this.nextChunk()', function() {
    it('moves to the next sentence - mind how ids can be non-sequential!', function() {
      navigator.addSentences(sentences);
      expect(navigator.currentChunk()).toEqual(s1.tokens);

      navigator.nextChunk();
      expect(navigator.currentChunk()).toEqual(s3.tokens);
    });

    it('updates the state object', function() {
      navigator.addSentences(sentences);
      navigator.nextChunk();
      expect(state.tokens).toBe(navigator.currentChunk());
    });

    it('does nothing when there is no next sentence', function() {
      navigator.addSentences(sentences);
      navigator.goToLast();
      expect(navigator.currentChunk()).toEqual(s5.tokens);
      navigator.nextChunk();
      expect(navigator.currentChunk()).toEqual(s5.tokens);
    });

    describe('with larger chunk sizes', function() {
      it('moves in chunk sizes', function() {
        navigator.addSentences(sentences.concat(sentences));
        navigator.changeChunkSize(2);
        expect(navigator.status.currentPos).toEqual(0);
        navigator.nextChunk();
        expect(navigator.status.currentPos).toEqual(2);
      });
    });
  });

  describe('this.prevChunk()', function() {
    it('moves to the previous sentence - ids can be non-sequential', function() {
      navigator.addSentences(sentences);
      navigator.nextChunk();
      navigator.nextChunk();
      expect(navigator.currentChunk()).toEqual(s5.tokens);

      navigator.prevChunk();
      expect(navigator.currentChunk()).toEqual(s3.tokens);
    });

    it('updates the state object', function() {
      navigator.addSentences(sentences);
      navigator.nextChunk();
      navigator.prevChunk();
      expect(state.tokens).toEqual(navigator.currentChunk());
    });

    it('does nothing when there is no previous sentence', function() {
      navigator.addSentences(sentences);
      expect(navigator.currentChunk()).toEqual(s1.tokens);
      navigator.prevChunk();
      expect(navigator.currentChunk()).toEqual(s1.tokens);
    });

    describe('with larger chunk sizes', function() {
      it('moves in chunk sizes', function() {
        navigator.addSentences(sentences.concat(sentences));
        navigator.changeChunkSize(2);
        expect(navigator.status.currentPos).toEqual(0);
        navigator.nextChunk();
        navigator.nextChunk();
        expect(navigator.status.currentPos).toEqual(4);
        navigator.prevChunk();
        expect(navigator.status.currentPos).toEqual(2);
      });

      it('cannot move beyond boundaries', function() {
        navigator.addSentences(sentences);
        navigator.nextChunk();
        navigator.changeChunkSize(2);
        expect(navigator.status.currentPos).toEqual(1);
        navigator.prevChunk();
        expect(navigator.status.currentPos).toEqual(0);
      });
    });
  });

  describe('this.goToLast()', function() {
    it('goes to the last element in the sentences array', function() {
      navigator.addSentences(sentences);

      navigator.goToLast();
      expect(navigator.currentChunk()).toEqual(s5.tokens);
    });

    it('updates the state object', function() {
      navigator.addSentences(sentences);
      navigator.goToLast();
      expect(state.tokens).toEqual(navigator.currentChunk());
    });
  });

  describe('this.goToFirst', function() {
    it('goes. to the first element in the sentence array', function() {
      navigator.addSentences(sentences);
      navigator.goToLast();
      expect(navigator.currentChunk()).toEqual(s5.tokens);

      navigator.goToFirst();
      expect(navigator.currentChunk()).toEqual(s1.tokens);
    });

    it('updates the state object', function() {
      navigator.addSentences(sentences);
      navigator.goToLast();
      navigator.goToFirst();
      expect(state.tokens).toEqual(navigator.currentChunk());
    });
  });

  describe('this.goTo()', function() {
    it('goes to a sentence identified by its id', function() {
      navigator.addSentences(sentences);

      navigator.goTo('3');
      expect(navigator.currentChunk()).toEqual(s3.tokens);

      navigator.goTo('5');
      expect(navigator.currentChunk()).toEqual(s5.tokens);
    });

    it('updates the state object', function() {
      navigator.addSentences(sentences);
      navigator.goTo('5');
      expect(state.tokens).toEqual(navigator.currentChunk());
    });

    it('returns true when the call succeeds', function() {
      navigator.addSentences(sentences);
      expect(navigator.goTo('5')).toBeTruthy();
    });
  });

  describe('this.goToByPosition', function() {
    it('goes to a sentence identified by its container position', function() {
      navigator.addSentences(sentences);
      navigator.goToByPosition(1);
      expect(navigator.currentChunk()).toEqual(s3.tokens);
    });
  });

  describe('this.hasNext()', function() {
    it('determines if a next sentence is available', function() {
      navigator.addSentences(sentences);

      expect(navigator.hasNext()).toBeTruthy();

      navigator.goTo('5');
      expect(navigator.hasNext()).toBeFalsy();
    });

    describe('with a larger chunk size', function() {
      it('determines if something next is available', function() {
        navigator.addSentences(sentences);
        navigator.changeChunkSize(3);

        expect(navigator.hasNext()).toBeFalsy();
      });
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

  describe('navigator.addToken()', function() {
    it('adds tokens to the sentence stores', function() {
      navigator.addSentences(sentences);
      var token = { id: '01-03', sentenceId: '1'};
      var firstSentence = navigator.sentencesById['1'].tokens;

      expect(firstSentence['01-03']).toBeUndefined();

      navigator.addToken(token);
      expect(firstSentence['01-03']).toBeDefined();
    });
  });

  describe('navigator.removeToken()', function() {
    it('removes a token from the sentence stores', function() {
      navigator.addSentences(sentences);
      var firstSentence = navigator.sentencesById['1'].tokens;
      var token = { id: '01-03', sentenceId: '1'};
      navigator.addToken(token);
      expect(firstSentence['01-03']).toBeDefined();

      navigator.removeToken(token);
      expect(firstSentence['01-03']).toBeUndefined();
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
