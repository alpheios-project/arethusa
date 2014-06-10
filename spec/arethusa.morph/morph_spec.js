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
      var res  = angular.extend({}, form, { attributes: { pos: 'adj', pers: '1st' }});
      morph.postagToAttributes(form);
      expect(form).toEqual(res);
    });
  });

  describe('this.attributesToPostag', function() {
    it('creates a postag string out of attributes', function() {
      var attrs = { pos: 'noun', pers: '2nd' };
      var res = 'n2';
      var postag = morph.attributesToPostag(attrs);
      expect(postag).toEqual(res);
    });

    it('fills with - according to the postagSchema, when an attribute is undefined', function() {
      var attrs = { pers: '1st' };
      var res = '-1';
      var postag = morph.attributesToPostag(attrs);
      expect(postag).toEqual(res);
    });
  });

  describe('this.updatePostag', function() {
    it('updates a postag at a specific datapoint', function() {
      var form = { postag: '--' };
      morph.updatePostag(form, 'pos', 'noun');
      expect(form.postag).toEqual('n-');
    });
  });

  describe('this.emptyPostag', function() {
    it('returns an empty postag according to the configured postagSchema', function() {
      expect(morph.emptyPostag()).toEqual('--');
    });
  });
});
