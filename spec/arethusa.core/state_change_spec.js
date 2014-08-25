"use strict";

describe('StateChange', function() {
  var StateChange;
  var token;

  function Token() {
    this.string = 'test';
    this.id = '1';
    this.a = { b: { c: 'c' } };
  }

  var broadcasted, notified;

  var state = {
    change: function(t, p, n) { new StateChange(state, t, p, n).exec();  },
    getToken: function(id) { if (id === '1') return token; },
    broadcast: function() { broadcasted = true; },
    notifyWatchers: function() { notified = true; }
  };

  beforeEach(module("arethusa.core"));

  beforeEach(inject(function(_StateChange_) {
    broadcasted = notified = false;
    StateChange = _StateChange_;
    token = new Token();
  }));

  it('can be constructed with a an id', function() {
    var change = new StateChange(state, '1');
    expect(change.token).toEqual(token);
  });

  it('can be constructed with a token', function() {
    var change = new StateChange(state, token);
    expect(change.token).toEqual(token);
  });

  describe('exec()', function() {
    it('provides an exec function to change a tokens property', function() {
      var newVal = 'myValue';
      var change = new StateChange(state, '1', 'a.b', newVal);

      expect(token.a.b).not.toEqual(newVal);
      change.exec();
      expect(token.a.b).toEqual(newVal);
    });

    it('a special function executed prior to exec() can be given 6th argument', function() {
      var preExecuted = false;
      var preExecFn = function() { preExecuted = true; };

      var change = new StateChange(state, '1', 'a.b', 'myVal', false, preExecFn);

      change.exec();
      expect(preExecuted).toBeTruthy();
    });

    it('broadcasts through state', function() {
      expect(broadcasted).toBeFalsy();

      var change = new StateChange(state, '1', 'a.b', '2');
      change.exec();

      expect(broadcasted).toBeTruthy();
    });

    it('notifies watchers through state', function() {
      expect(notified).toBeFalsy();

      var change = new StateChange(state, '1', 'a.b', '2');
      change.exec();

      expect(notified).toBeTruthy();
    });
  });

  it('holds a reference to the old and new value', function() {
    var oldVal = token.a.b.c;
    var newVal = 'd';
    var change = new StateChange(state, '1', 'a.b.c', newVal);

    change.exec();
    change.oldVal = oldVal;
    change.newVal = newVal;
  });

  it('is timestamped', function() {
    var change = new StateChange(state, '1', 'a.b.c', 'x');
    change.exec();
    expect(change.time).toBeTruthy();
  });

  it('has a the type "changed"', function() {
    var change = new StateChange(state, '1', 'a.b.c', 'x');
    expect(change.type).toEqual('change');
  });

  describe('undo()', function() {
    it('provides means to undo a change as a simple inversion of oldVal and newVal', function() {
      var oldVal = token.a.b.c;
      var newVal = 'x';
      var change = new StateChange(state, '1', 'a.b.c', newVal);

      expect(token.a.b.c).toEqual(oldVal);
      change.exec();
      expect(token.a.b.c).toEqual(newVal);
      change.undo();
      expect(token.a.b.c).toEqual(oldVal);
    });

    it('takes a custom undo function as fourth argument', function() {
      var oldVal = token.a.b.c;
      var newVal = 'x';
      var customVal = 'custom';
      var undoFn = function() { token.a.b.c = customVal; };

      var change = new StateChange(state, '1', 'a.b.c', newVal, undoFn);

      expect(token.a.b.c).toEqual(oldVal);
      change.exec();
      expect(token.a.b.c).toEqual(newVal);
      change.undo();
      expect(token.a.b.c).toEqual(customVal);
    });
  });
});
