"use strict";

describe("morph", function() {
  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
    getRetrievers: function(name) {
      return {};
    },
    getConfAndDelegate: function(name, obj) {
      obj.attributes = {
        "pos" : {
          "long" : "Part of Speech",
          "short" : "pos",
          "values" : {
            "noun" : {
              "long" : "noun",
              "short" : "noun",
              "postag" : "n",
              "style" : {
                "color" : "black"
              }
            },
            "adj" : {
              "long" : "adjective",
              "short" : "adj",
              "postag" : "a",
              "style" : {
                "color" : "blue"
              }
            }
          }
        },
        "pers" : {
          "long" : "Person",
          "short" : "pers",
          "values" : {
            "1st" : {
              "long" : "first person",
              "short" : "1st",
              "postag" : "1"
            },
            "2nd" : {
              "long" : "second person",
              "short" : "2nd",
              "postag" : "2"
            }
          }
        }
      };
      obj.postagSchema = ['pos', 'pers'];
      obj.styledThrough = 'pos';
      obj.conf = {};
    }
  };

  var createTokens = function() {
    return {
      '01': {
        id: '01',
        string: 't1',
        morphology: {
          lemma: 'lemma1',
          postag: 'n-'
        }
      },
      '02': {
        id: '02',
        string: 't2',
        morphology: {
          lemma: 'lemma2',
          postag: 'a1'
        }
      }
    };
  };

  beforeEach(module("arethusa.core", function($provide) {
    $provide.value('configurator', mockConfigurator);
  }));

  beforeEach(module("arethusa.morph"));

  var morph;
  var state;
  beforeEach(inject(function(_morph_, _state_) {
    state = _state_;
    state.tokens = createTokens();
    morph = _morph_;
    morph.init();
  }));

  describe('this.postagToAttributes', function() {
    it('expands a postag to full key value pairs', function() {
      var form = { postag: 'a1' };
      var res  = { postag: 'a1', attributes: { pos: 'adj', pers: '1st' }};
      morph.postagToAttributes(form);
      expect(form).toEqual(res);
    });
  });
});
