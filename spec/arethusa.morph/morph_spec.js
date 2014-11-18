"use strict";

describe("morph", function() {
  function morphConf(obj) {
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
            "postag" : "1",
            "style" : {
              "text-decoration": "underline"
            }
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
    obj.conf = {};
  }

  var morph, state;

  beforeEach(function() {
    module("arethusa.core", function($provide) {
      var custom = { getConfAndDelegate: morphConf };
      $provide.value('configurator', arethusaMocks.configurator(custom));
      $provide.value('plugins', arethusaMocks.plugins());
    });

    module("arethusa.morph");

    inject(function(_morph_, _state_) {
      state = _state_;
      state.initServices();
      state.tokens = arethusaMocks.tokens();
      morph = _morph_;
      morph.init();
    });
  });

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
      expect(morph.emptyPostag).toEqual('--');
    });
  });

  describe('this.emptyForm', function() {
    it('returns a new form object, with all properties in place but empty', function() {
      var res = {
        lemma: undefined,
        postag: '--',
        attributes: {
          pos: undefined,
          pers: undefined
        }
      };

      expect(morph.emptyForm()).toEqual(res);
    });

    it("takes a string to prefill the lemma", function() {
      var str = 'xxx';
      expect(morph.emptyForm(str).lemma).toEqual(str);
    });
  });

  describe('this.queryForm', function() {
    it('looks up forms in the state object and selects them', function() {
      expect(state.hasSelections()).toBeFalsy();
      morph.matchAll = false;
      morph.formQuery = 'adj';
      morph.queryForm();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('02')).toBeTruthy();
    });

    it('can look up by multiple attributes at the same time', function() {
      expect(state.hasSelections()).toBeFalsy();
      morph.matchAll = false;
      morph.formQuery = 'adj noun';
      morph.queryForm();
      expect(state.isSelected('01')).toBeTruthy();
      expect(state.isSelected('02')).toBeTruthy();
    });

    it('does a fuzzy search through all attributes of forms', function() {
      expect(state.hasSelections()).toBeFalsy();
      morph.matchAll = false;
      morph.formQuery = '1st';
      morph.queryForm();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('02')).toBeTruthy();
    });

    it("doesn't create false hits", function() {
      expect(state.hasSelections()).toBeFalsy();
      morph.matchAll = false;
      morph.formQuery = '3rd';
      morph.queryForm();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('02')).toBeFalsy();
    });

    it('optionally searches for forms that satisfy multiple attributes', function() {
      expect(state.hasSelections()).toBeFalsy();
      morph.matchAll = true;
      morph.formQuery = 'noun 2nd';
      morph.queryForm();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('02')).toBeFalsy();

      morph.formQuery = 'adj 1st';
      morph.queryForm();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('02')).toBeTruthy();
    });

    it('only searches for short versions of attribute values for now', function() {
      expect(state.hasSelections()).toBeFalsy();
      morph.matchAll = false;
      morph.formQuery = 'adj';
      morph.queryForm();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('02')).toBeTruthy();

      morph.formQuery = 'adjective';
      morph.queryForm();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('02')).toBeFalsy();
    });

    it('reacts properly to runtime changes in the state object', function() {
      expect(state.hasSelections()).toBeFalsy();
      morph.matchAll = false;
      morph.formQuery = 'adj';
      morph.queryForm();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('02')).toBeTruthy();

      var newForm = {
        attributes: {
          pos: 'noun'
        }
      };

      morph.setState('02', newForm);
      morph.queryForm();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('02')).toBeFalsy();

      morph.formQuery = 'noun';
      morph.queryForm();
      expect(state.isSelected('01')).toBeTruthy();
      expect(state.isSelected('02')).toBeTruthy();

      morph.unsetState('02');
      morph.queryForm();
      expect(state.isSelected('01')).toBeTruthy();
      expect(state.isSelected('02')).toBeFalsy();
    });
  });

  describe('this.concatenatedAttributes', function() {
    it('returns a concatenated string of all attributes (short representation), joined by a dot', function() {
      var f1 = state.getToken('01').morphology;
      var f2 = state.getToken('02').morphology;

      expect(morph.concatenatedAttributes(f1)).toEqual('noun');
      expect(morph.concatenatedAttributes(f2)).toEqual('adj.1st');
    });
  });

  describe('this.styleOf', function() {
    it('returns a style object for a given form', function() {
      var nounStyle = {
        color : "black"
      };
      var f1 = state.getToken('01').morphology;

      expect(morph.styleOf(f1)).toEqual(nounStyle);
    });

    it('combines several styles defined by each attribute', function() {
      var adjStyle = {
        color: "blue",
        'text-decoration': 'underline'
      };

      var f2 = state.getToken('02').morphology;
      expect(morph.styleOf(f2)).toEqual(adjStyle);
    });
  });

  describe('this.currentAnalyses', function() {
    it('returns an obj containing arrays of forms of currently selected (e.g. clicked) tokens and other things', function() {
      var f1 = state.getToken('01').morphology;
      state.selectToken('01', 'click');
      var cA = morph.currentAnalyses();
      expect(cA['01'].forms).toEqual([f1]);
    });
  });

  describe('this.removeForm', function() {
    it('removes a form', function() {
      var f1 = state.getToken('01').morphology;
      expect(morph.analyses['01'].forms).toEqual([f1]);

      morph.removeForm('01', f1);
      expect(morph.analyses['01'].forms).toEqual([]);
    });
  });
});
