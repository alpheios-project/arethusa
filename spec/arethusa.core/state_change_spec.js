"use strict";

describe('StateChange', function() {
  var StateChange;
  var stateCalledCount;
  var token;

  function Token() {
    this.string = 'test';
    this.id = '1';
    this.a = { b: { c: 'c' } };
  }

  var state = {
    change: function() { stateCalledCount++; },
    getToken: function(id) { if (id === '1') return token; }
  };

  beforeEach(module("arethusa.core"));

  beforeEach(inject(function(_StateChange_) {
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
});
