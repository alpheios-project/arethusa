"use strict";

describe("state", function() {
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
    $provide.value('configurator', arethusaMocks.configurator());
  }));

  var state;
  var $rootScope;
  beforeEach(inject(function(_state_, _$rootScope_) {
    $rootScope = _$rootScope_;
    state = _state_;
    state.initServices();
    state.tokens = arethusaMocks.tokens();
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
      expect(state.clickedTokens).toEqual({'03' : 'click'});
    });

    it('selects multiple tokens with ctrl', function() {
      state.selectToken('01', 'ctrl-click');
      state.selectToken('03', 'ctrl-click');

      expect(state.selectedTokens).toEqual({'01': 'ctrl-click', '03': 'ctrl-click'});
    });

    it('distincts between hovered and clicked tokens', function() {
      state.selectToken('01', 'click');
      state.selectToken('02', 'hover');

      expect(state.selectedTokens).toEqual({ '01': 'click', '02': 'hover'});
      expect(state.clickedTokens).toEqual({ '01': 'click' });
    });
  });

  describe('this.deselectToken', function() {
    it('deselects a token', function() {
      state.selectToken('01', 'click');
      expect(state.isSelected('01')).toBeTruthy();
      expect(state.isClicked('01')).toBeTruthy();
      state.deselectToken('01', 'click');
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isClicked('01')).toBeFalsy();
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
      expect(state.isClicked('01')).toBeTruthy();
      expect(state.isClicked('03')).toBeTruthy();
      state.deselectAll();
      expect(state.isSelected('01')).toBeFalsy();
      expect(state.isSelected('03')).toBeFalsy();
      expect(state.isClicked('01')).toBeFalsy();
      expect(state.isClicked('03')).toBeFalsy();
    });
  });

  describe('this.isSelected', function() {
    it('returns true when a token is selected', function() {
      state.selectToken('01', 'ctrl-click');
      state.selectToken('02', 'hover');
      expect(state.isSelected('01')).toBeTruthy();
      expect(state.isSelected('02')).toBeTruthy();
    });
  });

  describe('this.isClicked', function() {
    it('returns true when a token was click-selected', function() {
      state.selectToken('01', 'ctrl-click');
      state.selectToken('02', 'hover');
      expect(state.isClicked('01')).toBeTruthy();
      expect(state.isClicked('02')).toBeFalsy();
    });
  });

  describe('this.hasSelections', function() {
    it('returns true when selections are present', function() {
      expect(state.hasSelections()).toBeFalsy();
      state.selectToken('02', 'hover');
      expect(state.hasSelections()).toBeTruthy();
    });
  });

  describe('this.hasClickSelections', function() {
    it('returns true when click selections are present', function() {
      expect(state.hasClickSelections()).toBeFalsy();
      state.selectToken('02', 'hover');
      expect(state.hasClickSelections()).toBeFalsy();
      state.selectToken('02', 'click');
      expect(state.hasClickSelections()).toBeTruthy();
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

  describe('this.firstSelected', function() {
    it('returns the id of the first selected token', function() {
      state.selectToken('01', 'ctrl-click');
      state.selectToken('02', 'ctrl-click');
      expect(state.firstSelected()).toEqual('01');
    });

    it('returns undefined when nothing is selected', function() {
      expect(state.firstSelected()).toBeUndefined();
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

  describe('this.addStyle', function() {
    it('adds a style to a token, identified by id', function() {
      var t1 = state.getToken('01');
      var style = {
        color: 'red',
        'font-style': 'italics'
      };
      t1.style = { color: 'red' };

      state.addStyle('01', { 'font-style': 'italics' });
      expect(t1.style).toEqual(style);
    });

    it('does not fail when no style was set before', function() {
      var t1 = state.getToken('01');
      state.addStyle('01', { color: 'red' });
      expect(t1.style).toEqual({ color: 'red' });
    });
  });

  describe('this.removeStyle', function() {
    it('deletes specific style property from a token', function() {
      var t1 = state.getToken('01');
      t1.style = { color: 'red' };
      state.removeStyle('01', 'color');
      expect(t1.style).toEqual({});
    });

    it('does not fail when no style was set before', function() {
      var t1 = state.getToken('01');
      state.removeStyle('01', 'color');
      expect(t1.style).toBeUndefined();
    });

    it('also takes an array of styles to be removed', function() {
      var t1 = state.getToken('01');
      t1.style = { color: 'red', 'font-style': 'bold' };
      state.removeStyle('01', ['color', 'font-style']);
      expect(t1.style).toEqual({});
    });
  });

  describe('this.unsetStyle', function() {
    it('deletes the style of a token, identified by id', function() {
      var t1 = state.getToken('01');
      var style = { color: 'red' };
      t1.style =  style;

      state.unsetStyle('01');
      expect(t1.style).toEqual({});
    });
  });

  describe('this.setState', function() {
    it('adds a given obj to the given category of a token, identified by id', function() {
      var morph = { postag: '-------' };
      var t1 = state.getToken('01');

      expect(t1.morphology).not.toBe(morph);
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

  describe('this.broadcast()', function() {
    it('broadcasts an event through $rootScope', function() {
      var test;
      $rootScope.$on('test', function(event, arg) {
        test = { event: event, arg: arg };
      });

      expect(test).toBeUndefined();

      state.broadcast('test', 'testArg');
      expect(test.event.name).toEqual('test');
      expect(test.arg).toEqual('testArg');
    });
  });

  describe('this.on()', function() {
    it('delegates to $rootScope.$on', function() {
      var test;
      state.on('test', function(event, arg) {
        test = { event: event, arg: arg };
      });

      $rootScope.$broadcast('test', 'testArg');
      expect(test.event.name).toEqual('test');
      expect(test.arg).toEqual('testArg');
    });
  });

  describe('this.change()', function() {
    it('changes a state object through StateChange', function() {
      var t1 = state.getToken('01');
      expect(t1.head.id).toEqual('03');

      state.change('01', 'head.id', '04');
      expect(t1.head.id).toEqual('04');
    });

    it('broadcast a tokenChange event', function() {
      var eventName;
      state.on('tokenChange', function(event, change) {
        eventName = event.name;
      });

      state.change('01', 'head.id', '04');
      expect(eventName).toEqual('tokenChange');
    });

    it('passes the StateChange object to the event', function() {
      var target;
      state.on('tokenChange', function(event, change) {
        target = change;
      });

      state.change('01', 'head.id', '04');
      expect(target.token).toEqual(state.getToken('01'));
      expect(target.newVal).toEqual('04');
    });
  });

  describe('this.watch()', function() {
    it('inits a watch for changes on a specific token property', function() {
      var test;
      state.watch('head.id', function(newVal, oldVal) {
        test = { newVal: newVal, oldVal: oldVal };
      });

      state.change('01', 'head.id', '04');
      expect(test.newVal).toEqual('04');
      expect(test.oldVal).toEqual('03');
    });

    it('passes the StateChange obj as third arg to the listener function', function() {
      var testToken;
      state.watch('head.id', function(newVal, oldVal, event) {
        testToken = event.token;
      });

      state.change('01', 'head.id', '04');
      expect(testToken).toEqual(state.getToken('01'));
    });

    it('takes the special property * to listen to all changes', function() {
      var test = 0;
      state.watch('*', function() { test++; });

      state.change('01', 'head.id', '04');
      expect(test).toEqual(1);

      state.change('02', 'string', 'x');
      expect(test).toEqual(2);
    });

    it('returns a deregistering function', function() {
      var test = 0;
      var watch = state.watch('*', function() { test++; });

      state.change('01', 'head.id', '04');
      expect(test).toEqual(1);

      watch();

      state.change('02', 'string', 'x');
      expect(test).toEqual(1);
    });

    it('takes a function called before deregistering as fourth argument', function() {
      var destroyed;
      var watch = state.watch('*',
                              function() {},
                              function() { destroyed = true; }
                             );

      state.change('01', 'head.id', '04');

      expect(destroyed).toBeFalsy();
      watch();
      expect(destroyed).toBeTruthy();
    });
  });

  describe('this.lazyChange()', function() {
    it('creates a StateChange object, but does not resolve it', function() {
      var t1 = state.getToken('01');
      var change = state.lazyChange('01', 'head.id', '04');

      expect(t1.head.id).toEqual('03');
      change.exec();
      expect(t1.head.id).toEqual('04');
    });

    it('does not fire events on its own', function() {
      var on;
      var watch;
      state.on('tokenChange', function() { on = true; });
      state.watch('*', function() { watch = true; });

      state.lazyChange('01', 'head.id', '04');
      expect(on).toBeFalsy();
      expect(watch).toBeFalsy();
    });
  });

  describe('this.doSilent()', function() {
    it('calls a function in silent mode', function() {
      var wasSilent = false;
      var fn = function() { wasSilent = state.silent; };

      state.silent = false; // true by default
      expect(state.silent).toBeFalsy();

      state.doSilent(fn);
      expect(wasSilent).toBeTruthy();
    });
  });

  describe('this.doBatched()', function() {
    it('calls a function in batchChange mode', function() {
      var wasBatchChange = false;
      var fn = function() { wasBatchChange = state.batchChange; };

      expect(state.batchChange).toBeFalsy();

      state.doBatched(fn);
      expect(wasBatchChange).toBeTruthy();
    });
  });

  describe('this.batchChangeStart()', function() {
    it('starts batchChangeMode', function() {
      expect(state.batchChange).toBeFalsy();
      state.batchChangeStart();
      expect(state.batchChange).toBeTruthy();
    });
  });

  describe('this.batchChangeStop()', function() {
    it('stops batchChangeMode and broadcast an event', function() {
      var listenerCalled = false;
      state.on('batchChangeStop', function() {
        listenerCalled = true;
      });

      state.batchChangeStart();
      expect(state.batchChange).toBeTruthy();
      state.batchChangeStop();
      expect(state.batchChange).toBeFalsy();
      expect(listenerCalled).toBeTruthy();
    });
  });
});
