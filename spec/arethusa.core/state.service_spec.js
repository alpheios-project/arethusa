"use strict";

describe("state", function() {
  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
    getRetrievers: function(name) {
      return {};
    }
  };

  var tokens = {
    '01': {
      id: '01',
      string: 'Arma',
      head: {
        id: '03'
      }
    },
    '02': {
      id: '02',
      string: 'virum',
      head: {
        id: '03',
      }
    },
    '03': {
      id: '03',
      string: '-que',
      head: {
        id: '04'
      }
    },
    '04': {
      id: '04',
      string: 'cano',
      head: {
        id: '00'
      }
    }
  };

  beforeEach(module("arethusa.core", function($provide) {
    $provide.value('configurator', mockConfigurator);
  }));

  describe("this.countTotalTokens", function() {
    it('counts the total number of tokens, exposed through this.totalTokens', inject(function(state, configurator) {
      state.tokens = tokens;
      state.countTotalTokens();
      expect(state.totalTokens).toEqual(4);
    }));
  });

  describe('this.countTokens', function() {
    it('returns a count of tokens for which the given function is true', inject(function(state, configurator) {
      state.tokens = tokens;
      var fn = function(token) {
        return token.string == "cano";
      };
      expect(state.countTokens(fn)).toEqual(1);
    }));
  });
});
