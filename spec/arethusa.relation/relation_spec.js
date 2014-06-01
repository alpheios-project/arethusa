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

  beforeEach(module("arethusa.relation", function($provide) {

  }));

  var relation;
  beforeEach(inject(function(_relation_, configurator, state) {
    state.tokens = createTokens();
    relation = _relation_;
  }));
});
