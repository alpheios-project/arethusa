"use strict";

describe('history', function() {
  var history, state;
  var undone, redone;

  beforeEach(function() {
    module("arethusa.core");

    module("arethusa.history", function($provide) {
      $provide.value('configurator', arethusaMocks.configurator());
      $provide.value('keyCapture', arethusaMocks.keyCapture());
    });

    inject(function(_history_, _state_) {
      history = _history_;
      state   = _state_;
      state.initServices();
      state.silent = false; // true by default
      history.init();
      undone = 0;
      redone = 0;
    });
  });

  function MockEvent(type) {
    this.exec = function() { redone++; };
    this.undo = function() { undone++; };
    this.type = type;
  }

  describe('this.canUndo', function() {
    it('is false on init', function() {
      expect(history.canUndo).toBeFalsy();
    });

    it('is true when element to undo is present', function() {
      history.saveEvent(new MockEvent());
      expect(history.canUndo).toBeTruthy();
    });

    it('is false when elements are present but we traversed the whole history', function() {
      history.saveEvent(new MockEvent());
      history.undo();
      expect(history.canUndo).toBeFalsy();
    });

    it('is true when we are on the end of the history and redo a step', function() {
      history.saveEvent(new MockEvent());
      history.undo();
      expect(history.canUndo).toBeFalsy();
      history.redo();
      expect(history.canUndo).toBeTruthy();
    });
  });

  describe('this.canRedo', function() {
    it('is false on init', function() {
      history.init();
      expect(history.canRedo).toBeFalsy();
    });

    it('is true after we have undone an event', function() {
      history.saveEvent(new MockEvent());
      expect(history.canRedo).toBeFalsy();
      history.undo();
      expect(history.canRedo).toBeTruthy();
    });

    it('is false when we are at the beginning of the history chain again', function() {
      history.saveEvent(new MockEvent());
      expect(history.canRedo).toBeFalsy();
      history.undo();
      expect(history.canRedo).toBeTruthy();
      history.redo();
      expect(history.canRedo).toBeFalsy();
    });
  });

  describe('this.undo()', function() {
    it('calls undo function of current event in history', function() {
      history.saveEvent(new MockEvent());
      expect(undone).toEqual(0);
      history.undo();
      expect(undone).toEqual(1);
    });

    it('calls the undo function in state.silent mode', function() {
      var silentMode = true;
      // An undo function usually triggers a tokenChange
      state.on('tokenChange', function() { silentMode = false; });
      history.saveEvent(new MockEvent());
      history.undo();
      expect(silentMode).toBeTruthy();
    });
  });

  describe('this.redo()', function() {
    it('calls exec function of an undone element', function() {
      expect(undone).toEqual(0);
      expect(redone).toEqual(0);
      history.saveEvent(new MockEvent());

      history.undo();
      expect(undone).toEqual(1);
      history.redo();
      expect(redone).toEqual(1);
    });
  });

  describe('this.save()', function() {
    it('saves an event to the history', function() {
      expect(history.events.length).toEqual(0);
      history.saveEvent(new MockEvent());
      expect(history.events.length).toEqual(1);
    });

    it('does not save events in state.silent mode', function() {
      expect(history.events.length).toEqual(0);
      state.silent = true;
      history.saveEvent(new MockEvent());
      expect(history.events.length).toEqual(0);
    });

    it('never saves more items than defined throught history.maxSize', function() {
      history.maxSize = 2;
      history.saveEvent(new MockEvent());
      history.saveEvent(new MockEvent());
      expect(history.events.length).toEqual(2);
      history.saveEvent(new MockEvent());
      expect(history.events.length).toEqual(2);
    });

    it('pops the oldest history event when maxSize is reached', function() {
      var a, b, c;
      a = new MockEvent();
      b = new MockEvent();
      c = new MockEvent();

      history.maxSize = 2;

      history.saveEvent(a);
      history.saveEvent(b);
      expect(history.events).toContain(a);
      expect(history.events).toContain(b);

      history.saveEvent(c);
      expect(history.events).not.toContain(a);
      expect(history.events).toContain(b);
      expect(history.events).toContain(c);
    });

    it('does not act like a tree', function() {
      var a, b, c, d;
      a = new MockEvent();
      b = new MockEvent();
      c = new MockEvent();
      d = new MockEvent();

      history.saveEvent(a);
      history.saveEvent(b);
      history.saveEvent(c);

      history.undo(); // we're now at b again

      history.saveEvent(d);
      expect(history.events).toContain(a);
      expect(history.events).toContain(b);
      expect(history.events).not.toContain(c);
      expect(history.events).toContain(d);
    });
  });

  describe('watches', function() {
    it('all events issued through state.change and saves them', function() {
      var event = { property: 'head.id', newVal: 1, oldVal: 2 };

      expect(history.events.length).toEqual(0);
      state.change({}, 'head.id', 1, 2);
      expect(history.events.length).toEqual(1);
    });

    it('all tokenAdded events', function() {
      expect(history.events.length).toEqual(0);
      state.broadcast('tokenAdded', {});
      expect(history.events.length).toEqual(1);
    });

    it('all tokenRemoved events', function() {
      expect(history.events.length).toEqual(0);
      state.broadcast('tokenRemoved', {});
      expect(history.events.length).toEqual(1);
    });
  });
});

