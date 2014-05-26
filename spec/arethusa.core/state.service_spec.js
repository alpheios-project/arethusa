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

  /* Default tree:
   *     04:cano
   *        |
   *     03:-que
   *      /   \
   *  01:Arma 02:virum
   */
  describe('this.handleChangeHead', function() {
    var state;
    beforeEach(inject(function(_state_) {
      state = _state_;
      state.tokens = tokens;
    }));

    /*
     *     04:cano
     *     /    \
     * 03:-que 01:Arma
     *     |
     *  02:virum
     */
    it('parents a leaf node to the root', function() {
      state.selectToken('01', 'click');

      state.selectToken('04', 'click');

      expect(state.getToken('01').head.id).toBe('04');
    });

    /*
     *     04:cano
     *        |
     *     03:-que
     *        |
     *    02:virum
     *        |
     *     01:Arma
     */
    it('parents a leaf node to another leaf node', function() {
      state.selectToken('01', 'click');

      state.selectToken('02', 'click');

      expect(state.getToken('01').head.id).toBe('02');
    });

    /* Default tree:
     *     04:cano
     *        |
     *     01:Arma
     *        |
     *     03:-que
     *        |
     *    02:virum
     */
    xit('parents an inner node to a leaf node', function() {
      state.selectToken('03', 'click');

      state.selectToken('01', 'click');

      expect(state.getToken('03').head.id).toBe('01');
      expect(state.getToken('02').head.id).toBe('03');
      expect(state.getToken('01').head.id).toBe('04');
    });
  });
});
