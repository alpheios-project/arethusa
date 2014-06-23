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

  var createTokens = function() {
    return {
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
  };

  beforeEach(module("arethusa.core", function($provide) {
    $provide.value('configurator', mockConfigurator);
  }));

  var state;
  beforeEach(inject(function(_state_) {
    state = _state_;
    state.tokens = createTokens();
  }));

  describe("this.countTotalTokens", function() {
    it('counts the total number of tokens, exposed through this.totalTokens', function() {
      state.countTotalTokens();
      expect(state.totalTokens).toEqual(4);
    });
  });

  describe('this.countTokens', function() {
    it('returns a count of tokens for which the given function is true', function() {
      var fn = function(token) {
        return token.string == "cano";
      };
      expect(state.countTokens(fn)).toEqual(1);
    });
  });

  describe('this.getToken', function() {
    it('returns a token by id', function() {
      var res = state.tokens['01'];
      expect(state.getToken('01')).toBe(res);
    });
  });

  describe('this.asString', function() {
    it('returns the string of a token identified by id', function() {
      expect(state.asString('01')).toEqual('Arma');
    });
  });

  describe('this.selectToken()', function() {
    it('selects the clicked token', function() {
      state.selectToken('03', 'click');

      expect(state.selectedTokens).toEqual({'03': 'click'});
    });

    it('deselects all tokens after head change', function() {
      state.selectToken('01', 'click');
      state.selectToken('03', 'click', true);

      expect(state.selectedTokens).toEqual({});
    });

    it('selects multiple tokens with ctrl', function() {
      state.selectToken('01', 'ctrl-click');
      state.selectToken('03', 'ctrl-click');

      expect(state.selectedTokens).toEqual({'01': 'ctrl-click', '03': 'ctrl-click'});
    });
  });

  describe('this.deselectToken', function() {
    it('deselects a token', function() {
      state.selectToken('01', 'click');
      expect(state.isSelected('01')).toBeTruthy();
      state.deselectToken('01', 'click');
      expect(state.isSelected('01')).toBeFalsy();
    });

    it('selection type has to be the same to do a proper deselect', function() {
      state.selectToken('01', 'click');
      expect(state.isSelected('01')).toBeTruthy();
      state.deselectToken('01', 'hover');
      expect(state.isSelected('01')).toBeTruthy();
    });
  });

  describe('this.deselectAll', function() {
    it('deselects all selected tokens, no matter the selection type', function() {
      state.selectToken('01', 'ctrl-click');
      state.selectToken('03', 'ctrl-click');
      expect(state.isSelected('01')).toBeTruthy();
      expect(state.isSelected('03')).toBeTruthy();
      state.deselectAll();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('03')).toBeFalsy();
    });
  });

  describe('this.toggleSelection', function() {
    it('toggles the selection of a token', function() {
      state.toggleSelection('01', 'click');
      expect(state.isSelected('01')).toBeTruthy();
      state.toggleSelection('01', 'click');
      expect(state.isSelected('01')).toBeFalsy();
    });

    it('takes hover and click differences into account', function() {
      state.toggleSelection('01', 'hover');
      expect(state.isSelected('01')).toBeTruthy();
      state.toggleSelection('01', 'click');
      expect(state.isSelected('01')).toBeTruthy();
    });
  });

  describe('this.selectNextToken', function() {
    it('watches the first active selection and selects the next token', function() {
      state.selectToken('01', 'click');
      state.selectNextToken();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('02')).toBeTruthy();
    });

    it('always takes the first - even if there is more than one selection', function() {
      state.selectToken('01', 'ctrl-click');
      state.selectToken('03', 'ctrl-click');
      state.selectNextToken();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('03')).toBeFalsy();
      expect(state.isSelected('02')).toBeTruthy();
    });

    it('selects the first token if no selection was made before', function() {
      state.selectNextToken();
      expect(state.isSelected('01')).toBeTruthy();
    });

    it('starts at the top when current selection is the last token', function() {
      state.selectToken('04');
      state.selectNextToken();
      expect(state.isSelected('01')).toBeTruthy();
    });
  });

  describe('this.selectPrevToken', function() {
    it('works just as selectNextToken, only the other way around', function() {
      state.selectToken('01');
      state.selectPrevToken();
      expect(state.isSelected('04')).toBeTruthy();
      state.selectPrevToken();
      expect(state.isSelected('03')).toBeTruthy();

      state.deselectAll();
      state.selectPrevToken();
      expect(state.isSelected('04')).toBeTruthy();
    });
  });

  describe('this.replaceState', function() {
    it('takes a new tokens object and replaces it on the state object', function() {
      var newTokens = {};
      expect(state.tokens).not.toEqual(newTokens);
      state.replaceState(newTokens);
      expect(state.tokens).toBe(newTokens);
    });

    it('deselects everything in the process', function() {
      state.selectToken('01');
      state.replaceState({});
      expect(state.hasSelections()).toBeFalsy();
    });
  });

  describe('this.setStyle', function() {
    it('sets the style of a token, identified by id', function() {
      var t1 = state.getToken('01');
      var style = { color: 'red' };

      expect(t1.style).toBeUndefined();
      state.setStyle('01', style);
      expect(t1.style).toBe(style);
    });
  });

  describe('this.unsetStyle', function() {
    it('deletes the style of a token, identified by id', function() {
      var t1 = state.getToken('01');
      var style = { color: 'red' };
      t1.style =  style;

      state.unsetStyle('01');
      expect(t1.style).toBeUndefined();
    });
  });

  describe('this.setState', function() {
    it('adds a given obj to the given category of a token, identified by id', function() {
      var morph = { postag: '-------' };
      var t1 = state.getToken('01');

      expect(t1.morphology).toBeUndefined();
      state.setState('01', 'morphology', morph);
      expect(t1.morphology).toBe(morph);
    });
  });

  describe('this.unsetState', function() {
    it('deletes the given property of a token, identified by id', function() {
      var t1 = state.getToken('01');

      expect(t1.head).toBeDefined();
      state.unsetState('01', 'head');
      expect(t1.head).toBeUndefined();
    });
  });

  describe('this.addStatusObjects', function() {
    it('adds a status container to all tokens', function() {
      var t1 = state.getToken('01');
      var t4 = state.getToken('04');

      expect(t1.status).toBeUndefined();
      expect(t4.status).toBeUndefined();

      state.addStatusObjects();

      expect(t1.status).toEqual({});
      expect(t4.status).toEqual({});
    });
  });

  describe('this.registerListener', function() {
    it('registers a listener, distinguished as external or internal', function() {
      var extList = { external: true };
      var intList = {};

      state.registerListener(extList);
      state.registerListener(intList);

      expect(state.listeners).toContain(intList);
      expect(state.externalListeners).toContain(extList);
    });
  });

  describe('this.notifyListeners', function() {
    it('notifies all listeners', function() {
      var event = 'event';
      var tester = [];
      var listener = {
        catchEvent: function(event) {
          tester.push(event);
        }
      };

      state.registerListener(listener);
      state.notifyListeners(event);

      expect(tester).toEqual(['event']);
    });

    it('external listeners need to implement catchArethusaEvent()', function() {
      var event = 'event';
      var tester = [];
      var extListener = {
        external: true,
        catchArethusaEvent: function(event) {
          tester.push(event);
        }
      };

      state.registerListener(extListener);
      state.notifyListeners(event);

      expect(tester).toEqual(['event']);
    });
  });

  /* Default tree:
   *     04:cano
   *        |
   *     03:-que
   *      /   \
   *  01:Arma 02:virum
   */
  describe('this.handleChangeHead', function() {
    /*
     *     04:cano
     *     /    \
     * 03:-que 01:Arma
     *     |
     *  02:virum
     */
    it('parents a leaf node to the root', function() {
      state.selectToken('01', 'click');

      state.selectToken('04', 'click', true);

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

      state.selectToken('02', 'click', true);

      expect(state.getToken('01').head.id).toBe('02');
    });

    /*
     *     04:cano
     *        |
     *     01:Arma
     *        |
     *     03:-que
     *        |
     *    02:virum
     */
    it('parents an inner node to a leaf node', function() {
      state.selectToken('03', 'click');

      state.selectToken('01', 'click', true);

      expect(state.getToken('03').head.id).toBe('01');
      expect(state.getToken('02').head.id).toBe('03');
      expect(state.getToken('01').head.id).toBe('04');
    });

    describe('with multiple selection', function() {
      /*
       *         04:cano
       *      /     |     \
       * 01:Arma 02:virum 03:-que
       */
      it('parents two leaf nodes to an inner node', function() {
        state.selectToken('01', 'click');
        state.selectToken('02', 'ctrl-click');

        state.selectToken('04', 'click', true);

        expect(state.getToken('01').head.id).toBe('04');
        expect(state.getToken('02').head.id).toBe('04');
        expect(state.getToken('03').head.id).toBe('04');
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
      it('ignores node in multiselection if it becomes head', function() {
        state.selectToken('01', 'click');
        state.selectToken('02', 'ctrl-click');

        state.selectToken('02', 'click', true);

        expect(state.getToken('01').head.id).toBe('02');
        expect(state.getToken('02').head.id).toBe('03');
      });

      it('does not change a head when not explicitly requested through a third param boolean to selectToken', function() {
        var headOfOne = state.getToken('01').head.id;

        expect(headOfOne).toBe('03');

        state.selectToken('01', 'click');
        state.selectToken('02', 'click');

        // nothing has changed, 2 only got selected
        expect(headOfOne).toBe('03');
        expect(state.isSelected('02')).toBeTruthy();
      });
    });
  });

  describe('this.headsFor', function() {
    it('returns an empty array for the root', function() {
      expect(state.headsFor('00')).toEqual([]);
    });

    it('returns an array of head ids', function() {
      expect(state.headsFor('01')).toEqual(['03', '04', '00']);
    });
  });
});
