"use strict";

describe('keyCapture', function() {
  beforeEach(module('arethusa.core'));

  var keyCapture;
  beforeEach(inject(function(_keyCapture_) {
    keyCapture = _keyCapture_;
  }));

  var Event = function(key, shift, ctrl) {
    this.keyCode = key;
    this.shiftKey = shift;
    this.ctrlKey = ctrl;
    this.target = { tagname: '' };
  };

  describe('onKeyPressed', function() {
    it('calls the given callback', function() {
      // 27 is esc
      var event = new Event(27);

      var callbackCalled = false;
      var callback = function() { callbackCalled = true; };
      keyCapture.onKeyPressed('esc', callback);

      keyCapture.keyup(event);

      expect(callbackCalled).toBe(true);
    });

    it('handles shifted keys', function() {
      // 74 is j
      var eventWithShift    = new Event(74, true);
      var eventWithoutShift = new Event(74);
      var e1callbackCalled = 0;
      var e2callbackCalled = 0;
      var e1callback = function() { e1callbackCalled++; };
      var e2callback = function() { e2callbackCalled++; };

      keyCapture.onKeyPressed('J', e1callback);
      keyCapture.onKeyPressed('j', e2callback);

      keyCapture.keyup(eventWithShift);
      expect(e1callbackCalled).toEqual(1);
      expect(e2callbackCalled).toEqual(0);

      keyCapture.keyup(eventWithoutShift);
      expect(e1callbackCalled).toEqual(1);
      expect(e2callbackCalled).toEqual(1);
    });

    it('allows shift to be expressed in several ways', function() {
      var eventWithShift   = new Event(74, true);
      var e1callbackCalled = 0;
      var e2callbackCalled = 0;
      var e3callbackCalled = 0;
      var e1callback = function() { e1callbackCalled++; };
      var e2callback = function() { e2callbackCalled++; };
      var e3callback = function() { e3callbackCalled++; };

      keyCapture.onKeyPressed('J', e1callback);
      keyCapture.onKeyPressed('shift-j', e2callback);
      keyCapture.onKeyPressed('shift-J', e3callback);

      keyCapture.keyup(eventWithShift);
      expect(e1callbackCalled).toEqual(1);
      expect(e2callbackCalled).toEqual(1);
      expect(e3callbackCalled).toEqual(1);
    });

    it('handles ctrl keys', function() {
      // 74 is j
      var eventWithCtrl    = new Event(74, false, true);
      var eventWithoutCtrl = new Event(74);
      var e1callbackCalled = 0;
      var e2callbackCalled = 0;
      var e1callback = function() { e1callbackCalled++; };
      var e2callback = function() { e2callbackCalled++; };

      keyCapture.onKeyPressed('ctrl-j', e1callback);
      keyCapture.onKeyPressed('j', e2callback);

      keyCapture.keyup(eventWithCtrl);
      expect(e1callbackCalled).toEqual(1);
      expect(e2callbackCalled).toEqual(0);

      keyCapture.keyup(eventWithoutCtrl);
      expect(e1callbackCalled).toEqual(1);
      expect(e2callbackCalled).toEqual(1);
    });

    it('handles ctrl and shift together', function() {
      var eventWithCtrlAndShift = new Event(74, true, true);
      var eventWithoutAll = new Event(74);
      var e1callbackCalled = 0;
      var e2callbackCalled = 0;
      var e1callback = function() { e1callbackCalled++; };
      var e2callback = function() { e2callbackCalled++; };

      keyCapture.onKeyPressed('ctrl-J', e1callback);
      keyCapture.onKeyPressed('j', e2callback);

      keyCapture.keyup(eventWithCtrlAndShift);
      expect(e1callbackCalled).toEqual(1);
      expect(e2callbackCalled).toEqual(0);

      keyCapture.keyup(eventWithoutAll);
      expect(e1callbackCalled).toEqual(1);
      expect(e2callbackCalled).toEqual(1);
    });
  });

  describe('doRepeated', function() {
    it('calls a function 1 time by default', function() {
      var count = 0;
      var e13 = new Event(13); // 13 is return

      function fn() { keyCapture.doRepeated(function() { count++; });}

      keyCapture.onKeyPressed('return', fn);
      keyCapture.keyup(e13);
      expect(count).toEqual(1);
    });

    it('listens to numeric keyup events and calls a function several times then', function() {
      var count;
      var e1  = new Event(49); // 49 is 1
      var e9  = new Event(57); // 57 is 9
      var e13 = new Event(13); // 13 is return

      function fn() { keyCapture.doRepeated(function() { count++; });}

      keyCapture.onKeyPressed('return', fn);

      count = 0;
      keyCapture.keyup(e9);
      keyCapture.keyup(e13);
      expect(count).toEqual(9);

      count = 0;
      keyCapture.keyup(e1);
      keyCapture.keyup(e9);
      keyCapture.keyup(e13);
      expect(count).toEqual(19);
    });

    it('handles 0 hits properly', function() {
      var count;
      var e0  = new Event(48); // 49 is 0
      var e1  = new Event(49); // 49 is 1
      var e13 = new Event(13); // 13 is return

      function fn() { keyCapture.doRepeated(function() { count++; });}

      keyCapture.onKeyPressed('return', fn);

      count = 0;
      keyCapture.keyup(e0);
      keyCapture.keyup(e13);
      expect(count).toEqual(1);

      count = 0;
      keyCapture.keyup(e0);
      keyCapture.keyup(e1);
      keyCapture.keyup(e1);
      keyCapture.keyup(e13);
      expect(count).toEqual(11);
    });
  });
});
