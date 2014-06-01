"use strict";

describe("relation", function() {
  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
    getRetrievers: function(name) {
      return {};
    },
    getConfAndDelegate: function(name, obj) {
      var relations = {
        labels: {
          PRED : { short: "PRED", long: "predicate" },
          OBJ : { short: "OBJ", long: "object" },
          COORD : { short: "COORD", long: "coordination" }
        }
      };
      obj.conf = { relations: relations };
    }
  };

  var createTokens = function() {
    return {
      '01': {
        id: '01',
        string: 'Arma',
        relation: {
          label: "OBJ_CO"
        }
      },
      '02': {
        id: '02',
        string: 'virum',
        relation: {
          label: "OBJ_CO"
        }
      },
      '03': {
        id: '03',
        string: '-que',
        relation: {
          label: "COORD"
        }
      },
      '04': {
        id: '04',
        string: 'cano',
        relation: {
          label: "PRED"
        }
      }
    };
  };

  beforeEach(module("arethusa.core", function($provide) {
    $provide.value('configurator', mockConfigurator);
  }));

  beforeEach(module("arethusa.relation"));

  var relation;
  var state;
  beforeEach(inject(function(_relation_, configurator, _state_) {
    state = _state_;
    state.tokens = createTokens();
    relation = _relation_;
    relation.init();
  }));

  describe('label handling', function() {
    describe('this.buildLabel', function() {
      describe('build a label from prefix and suffix values', function () {
        it('combines a prefix and a suffix label to one, joined by an underscore', function() {
          var relationLabel = { prefix: "PRED", suffix: "CO" };
          relation.buildLabel(relationLabel);
          expect(relationLabel.label).toEqual("PRED_CO");
        });
      });

      it("doesn't add unnecessary underscores", function() {
        var relationLabel = { prefix: "ATR" };
        relation.buildLabel(relationLabel);
        expect(relationLabel.label).toEqual("ATR");
      });
    });

    describe('this.expandRelation', function() {
      describe('with two labels', function () {
        it('splits a label like PRED_CO into PRED and CO', function() {
          var relationLabel = { label: "PRED_CO" };
          relation.expandRelation(relationLabel);
          expect(relationLabel.prefix).toEqual("PRED");
          expect(relationLabel.suffix).toEqual("CO");
        });
      });

      describe('with one label', function () {
        it('does not affect single labels like PRED', function() {
          var relationLabel = { label: "PRED" };
          relation.expandRelation(relationLabel);
          expect(relationLabel.prefix).toEqual("PRED");
          expect(relationLabel.suffix).toBeUndefined();
        });
      });
    });
  });

  describe('multi changes', function() {
    describe('this.multiChangePossible', function() {
      it('is false when there is no selected token', function() {
        expect(relation.multiChangePossible()).toBeFalsy();
      });

      it('needs a valid multiChanger model', function() {
        state.selectToken('01', 'click');
        expect(relation.multiChangePossible()).toBeFalsy();

        relation.multiChanger = { prefix: "ATR" };
        expect(relation.multiChangePossible()).toBeTruthy();
      });
    });
  });
});
